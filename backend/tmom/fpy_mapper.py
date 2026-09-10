"""
FPY data mapper for PAP (Production Analytics Platform).

This module handles the normalization of T-MOM API responses into the
PAP FPY data format.

T-MOM fields to map:
    processGroup -> processSection
    projectName -> projectName
    orderType -> workOrderType
    processName -> processName
    orderCode -> workOrder
    productionStarts -> numberOfProductionStarts
    goodProducts -> numberOfGoodProducts
    defects -> numberOfDefects
    falseDetections -> numberOfFalseDetections
    defectRate -> defectRate
    falseDetectionRate -> falseDetectionRate
    firstPassYield -> firstPassYield
    fpy -> firstPassYieldFPY
    overallRTY -> overallFirstPassYieldRTY
"""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


def _safe_float(value: Any, default: float = 0.0) -> float:
    """
    Safely convert a value to float.
    
    Handles percentage strings like "98.50%" and None values.
    
    Args:
        value: Value to convert.
        default: Default value if conversion fails.
    
    Returns:
        Float value.
    """
    if value is None:
        return default
    
    if isinstance(value, (int, float)):
        return float(value)
    
    # Handle percentage strings like "98.50%"
    if isinstance(value, str):
        try:
            return float(value.replace("%", "").strip())
        except (ValueError, AttributeError):
            return default
    
    return default


def _safe_int(value: Any, default: int = 0) -> int:
    """
    Safely convert a value to int.
    
    Args:
        value: Value to convert.
        default: Default value if conversion fails.
    
    Returns:
        Int value.
    """
    if value is None:
        return default
    
    if isinstance(value, int):
        return value
    
    if isinstance(value, float):
        return int(value)
    
    if isinstance(value, str):
        try:
            return int(float(value.strip()))
        except (ValueError, AttributeError):
            return default
    
    return default


def _first_present(record, *keys, default=None):
    for k in keys:
        if k in record and record.get(k) is not None:
            return record.get(k)
    return default


def _safe_string(value: Any, default: str = "") -> str:
    """
    Safely convert a value to string.
    
    Args:
        value: Value to convert.
        default: Default value if conversion fails.
    
    Returns:
        String value.
    """
    if value is None:
        return default
    
    return str(value)


def map_tmom_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Map a single T-MOM record to PAP FPY format.

    Emits canonical numberOf* fields AND short frontend aliases so
    React (productionStarts, goodProducts, ...) reads the same values.
    Looks up multiple possible T-MOM key spellings safely.

    Args:
        record: Single record from T-MOM API response.

    Returns:
        Dict with mapped fields in PAP format.
    """
    process_section = _safe_string(
        _first_present(record, "processGroup", "processSection", "process_group"), "ASSY")
    project_name = _safe_string(
        _first_present(record, "projectName", "project_name", "boardName", "mainBoardName"))
    work_order_type = _safe_string(
        _first_present(record, "orderType", "workOrderType", "order_type", "woType"), "ZP02")
    process_name = _safe_string(
        _first_present(record, "processName", "process_name"))
    process_code = _safe_string(
        _first_present(record, "processCode", "process_code"))
    work_order = _safe_string(
        _first_present(record, "orderCode", "workOrder", "order_code", "woCode", "woNo"))
    production_line = _safe_string(
        _first_present(record, "productionLine", "productLine", "productLineCode", "lineName", "line", "production_line"))
    team = _safe_string(
        _first_present(record, "team", "teamName", "workgroup", "workgroupCode", "workGroup"))

    starts = _safe_int(_first_present(
        record, "totalProductionNum", "productionStarts", "numberOfProductionStarts",
        "production_starts", "startQty", "inputQty", "inQty", "totalProductionQty"))
    good = _safe_int(_first_present(
        record, "totalGoodNum", "goodProducts", "numberOfGoodProducts",
        "good_products", "goodQty", "okQty", "passQty", "totalGoodQty"))
    defects = _safe_int(_first_present(
        record, "totalFaultNum", "defects", "numberOfDefects", "defectQty", "ngQty", "failQty", "totalFaultQty"))
    false_det = _safe_int(_first_present(
        record, "totalMistakeNum", "falseDetections", "numberOfFalseDetections",
        "false_detections", "falseDetQty", "misjudgeQty", "totalMistakeQty"))
    defect_rate = _safe_float(_first_present(
        record, "defectRate", "defect_rate"))
    false_rate = _safe_float(_first_present(
        record, "mistakeRate", "falseDetectionRate", "false_detection_rate", "falseDetRate"))
    fpy = _safe_float(_first_present(
        record, "passRate", "firstPassYield", "fpy", "first_pass_yield", "fty"))
    fpy_alias = _safe_float(_first_present(record, "fpyRate", "passRate", "fpy", "firstPassYield"))
    rty = _safe_float(_first_present(
        record, "totalFpyRate", "overallRTY", "overallFirstPassYieldRTY", "rty", "overallFpy", "overall_yield"))
    record_date = _safe_string(_first_present(
        record, "recordDate", "cycleEndTime", "cycleStartTime", "statDate", "workDate", "productionDate", "date", "createTime"))

    return {
        # T-MOM terminology (canonical)
        "processSection": process_section,
        "projectName": project_name,
        "workOrderType": work_order_type,
        "processName": process_name,
        "processCode": process_code,
        "boardName": _safe_string(
            _first_present(record, "boardName", "mainBoardName", "boardOrProject")),
        "workOrder": work_order,
        "productionLine": production_line,
        "team": team,
        "recordDate": record_date,
        "numberOfProductionStarts": starts,
        "numberOfGoodProducts": good,
        "numberOfDefects": defects,
        "numberOfFalseDetections": false_det,
        "defectRate": defect_rate,
        "falseDetectionRate": false_rate,
        "firstPassYield": fpy,
        "firstPassYieldFPY": fpy_alias,
        "overallFirstPassYieldRTY": rty,
        # Frontend aliases (same values, short names used by AssemblyFPY.jsx)
        "processGroup": process_section,
        "orderType": work_order_type,
        "orderCode": work_order,
        "productionStarts": starts,
        "goodProducts": good,
        "defects": defects,
        "falseDetections": false_det,
        "fpy": fpy_alias,
        "overallRTY": rty,
    }
def map_tmom_response(tmom_response: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Map the complete T-MOM API response to PAP FPY format.
    
    Args:
        tmom_response: Complete response from T-MOM API.
    
    Returns:
        List of mapped records in PAP format.
    
    Raises:
        ValueError: If response format is invalid.
    """
    # Extract data array from T-MOM response
    data = tmom_response.get("data", {})
    
    if isinstance(data, dict):
        records = data.get("data", [])
    elif isinstance(data, list):
        records = data
    else:
        raise ValueError("Invalid T-MOM response format: unable to extract data")
    
    if not isinstance(records, list):
        raise ValueError("Invalid T-MOM response format: data is not a list")
    
    # Map each record
    mapped_records = []
    for record in records:
        try:
            mapped_record = map_tmom_record(record)
            mapped_records.append(mapped_record)
        except Exception as e:
            logger.warning(f"Failed to map T-MOM record: {type(e).__name__}")
            continue
    
    logger.info(f"Mapped {len(mapped_records)} records from T-MOM response")
    return mapped_records


def calculate_summary(records: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate summary statistics from FPY records.
    """
    if not records:
        return {
            "productionStarts": 0,
            "goodProducts": 0,
            "defects": 0,
            "falseDetections": 0,
            "fpy": 0,
            "rty": 0
        }
    
    total_starts = sum(r.get("numberOfProductionStarts", 0) for r in records)
    total_good = sum(r.get("numberOfGoodProducts", 0) for r in records)
    total_defects = sum(r.get("numberOfDefects", 0) for r in records)
    total_false_detections = sum(r.get("numberOfFalseDetections", 0) for r in records)
    
    overall_fpy = (total_good / total_starts * 100) if total_starts > 0 else 0
    
    rty_values = [r.get("overallFirstPassYieldRTY", 0) for r in records if r.get("overallFirstPassYieldRTY") is not None]
    overall_rty = sum(rty_values) / len(rty_values) if rty_values else 0
    
    return {
        "productionStarts": total_starts,
        "goodProducts": total_good,
        "defects": total_defects,
        "falseDetections": total_false_detections,
        "fpy": round(overall_fpy, 2),
        "rty": round(overall_rty, 2)
    }
