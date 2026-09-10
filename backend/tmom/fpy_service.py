"""
FPY service layer for PAP (Production Analytics Platform).

Handles business logic: date defaults, calling T-MOM client, mapping
the response, and any post-filtering that T-MOM's API does not natively
support (e.g. processName display-name filter).
"""

import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from .tmom_client import fetch_fpy_data, TMOMError, TMOMAuthenticationError
from .fpy_mapper import map_tmom_response, calculate_summary

logger = logging.getLogger(__name__)


def _post_filter(records: List[Dict[str, Any]], filters: Optional[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Apply any filters that the T-MOM API does not natively support.

    T-MOM's queryDetail endpoint has no processName parameter (only processCodeList).
    When the user selects a process by display-name (e.g. "ANTWBG") we must
    restrict the already-mapped records here.

    Other dimension filters (project, WO, processGroup, orderType) are sent to
    T-MOM directly; we do NOT re-filter those here to avoid double-restricting.
    """
    if not filters:
        return records

    process_names = filters.get('process_names')
    if process_names:
        # Normalise to a set of lower-case names for case-insensitive match
        wanted = {n.lower() for n in process_names}
        records = [
            r for r in records
            if (r.get('processName') or '').lower() in wanted
        ]
        logger.info(f"Post-filtered by processNames={process_names}: {len(records)} records remain")

    return records


def get_fpy_data(
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Get FPY data from T-MOM and return normalized data with summary.
    """
    if not start_time or not end_time:
        now = datetime.now()
        default_start = now.replace(hour=8, minute=0, second=0, microsecond=0) - timedelta(days=1)
        default_end = now.replace(hour=8, minute=0, second=0, microsecond=0)
        start_time = start_time or default_start.strftime("%Y-%m-%d %H:%M:%S")
        end_time = end_time or default_end.strftime("%Y-%m-%d %H:%M:%S")

    # Effective window actually sent to T-MOM (surfaced in the API response so
    # the frontend can display exactly which window the numbers cover).
    effective_start = start_time
    effective_end = end_time

    try:
        logger.info(f"Fetching FPY data from T-MOM: {start_time} to {end_time}, filters={filters}")
        tmom_response = fetch_fpy_data(start_time, end_time, filters)
        mapped_data = map_tmom_response(tmom_response)

        # Post-filter for dimensions T-MOM API does not filter natively
        mapped_data = _post_filter(mapped_data, filters)

        summary = calculate_summary(mapped_data)
        logger.info(f"Successfully retrieved {len(mapped_data)} FPY records from T-MOM")
        return {
            "success": True,
            "source": "tmom",
            "data": mapped_data,
            "count": len(mapped_data),
            "summary": summary,
            "metadata": {
                "start_time": effective_start,
                "end_time": effective_end,
                "record_count": len(mapped_data),
                "filters_applied": filters or {},
            }
        }
    except TMOMAuthenticationError as e:
        logger.error(f"T-MOM authentication error: {str(e)}")
        return {"success": False, "source": "tmom", "error": "authentication_error", "message": str(e), "data": [], "count": 0, "summary": get_empty_summary()}
    except TMOMError as e:
        logger.error(f"T-MOM API error: {str(e)}")
        return {"success": False, "source": "tmom", "error": "tmom_error", "message": str(e), "data": [], "count": 0, "summary": get_empty_summary()}
    except Exception as e:
        logger.error(f"Unexpected error fetching FPY data: {type(e).__name__}: {str(e)}")
        return {"success": False, "source": "tmom", "error": "internal_error", "message": "An unexpected error occurred while fetching FPY data", "data": [], "count": 0, "summary": get_empty_summary()}


def get_empty_summary() -> Dict[str, Any]:
    """Return an empty summary structure for error states."""
    return {"productionStarts": 0, "goodProducts": 0, "defects": 0, "falseDetections": 0, "fpy": 0, "rty": 0}
