"""
T-MOM API client for PAP (Production Analytics Platform).

This module handles the connection to the T-MOM API for fetching
First Pass Yield (FPY) data.

Endpoint:
    POST https://iipl-mom.transsion.com/mom-gateway/mom-reporting/workOrderFtyReport/queryDetail

Architecture:
    .env
       |
       v
    tmom_client.py (this file)
       |
       v
    fpy_service.py
       |
       v
    fpy_mapper.py
       |
       v
    Django API /api/assembly/fpy/
       |
       v
    React FPY Dashboard
"""

import os
import uuid
import logging
import requests
import urllib3
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# =============================================================================
# T-MOM API Configuration
# =============================================================================
# All configuration is read from environment variables defined in .env

# Base URL for T-MOM API
TMOM_BASE_URL = os.getenv('TMOM_BASE_URL', 'https://iipl-mom.transsion.com')

# T-MOM API endpoints
TMOM_FPY_ENDPOINT = os.getenv('TMOM_FPY_ENDPOINT', '/mom-gateway/mom-reporting/workOrderFtyReport/queryDetail')
TMOM_OAUTH_ENDPOINT = os.getenv('TMOM_OAUTH_ENDPOINT', '/mom-gateway/mom-auth/oauth/token')

# T-MOM Credentials - Set these in PAP/.env
TMOM_USERNAME = os.getenv('TMOM_USERNAME')
TMOM_PASSWORD = os.getenv('TMOM_PASSWORD')

# T-MOM Application Headers
TMOM_APP_ID = os.getenv('TMOM_APP_ID', 'c_MjMxMjAxMDAxYw')
TMOM_CHANNEL = os.getenv('TMOM_CHANNEL', 'PC')
TMOM_REFERER = os.getenv('TMOM_REFERER', 'https://iipl-mom.transsion.com/mompc/')

# Request timeout in seconds
REQUEST_TIMEOUT = 30

# SSL verification: the T-MOM server uses an internal/self-signed TLS
# certificate. The verified working login method disables certificate
# verification (verify=False). Set TMOM_VERIFY_SSL=true in PAP/.env to
# enforce strict certificate checking instead.
TMOM_VERIFY_SSL = os.getenv('TMOM_VERIFY_SSL', 'False').strip().lower() in ('1', 'true', 'yes')

if not TMOM_VERIFY_SSL:
    # Suppress InsecureRequestWarning noise triggered by verify=False.
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def _cfg(name: str, default: Optional[str] = None) -> Optional[str]:
    """Read a setting dynamically so dev-server .env reloads are honored."""
    return os.getenv(name, default)


def _tmom_base_url() -> str:
    return (_cfg("TMOM_BASE_URL", TMOM_BASE_URL) or TMOM_BASE_URL).rstrip("/")


def _tmom_oauth_endpoint() -> str:
    return _cfg("TMOM_OAUTH_ENDPOINT", TMOM_OAUTH_ENDPOINT) or TMOM_OAUTH_ENDPOINT


def _tmom_fpy_endpoint() -> str:
    return _cfg("TMOM_FPY_ENDPOINT", TMOM_FPY_ENDPOINT) or TMOM_FPY_ENDPOINT



# Default process codes for Assembly FPY
DEFAULT_PROCESS_CODES = [
    "ASSY003", "ASSY004", "ASSY007", "ASSY018", "ASSY016", "ASSY017", "ASSY019"
]

# =============================================================================
# Custom Exceptions
# =============================================================================

class TMOMError(Exception):
    """Custom exception for T-MOM API errors."""
    pass


class TMOMAuthenticationError(TMOMError):
    """Raised when authentication fails."""
    pass


class TMOMConnectionError(TMOMError):
    """Raised when connection to T-MOM fails."""
    pass


class TMOMTimeoutError(TMOMError):
    """Raised when request times out."""
    pass

# =============================================================================
# OAuth Authentication
# =============================================================================

def _get_access_token() -> str:
    """
    Obtain a fresh OAuth access token from T-MOM.
    
    Returns:
        Access token string.
    
    Raises:
        TMOMAuthenticationError: If authentication fails.
        TMOMConnectionError: If connection to T-MOM fails.
        TMOMTimeoutError: If request times out.
    """
    username = (_cfg("TMOM_USERNAME", TMOM_USERNAME) or "").strip().strip("'\"")
    password = (_cfg("TMOM_PASSWORD", TMOM_PASSWORD) or "").strip().strip("'\"")
    if not username or not password:
        raise TMOMAuthenticationError(
            "T-MOM credentials not configured. Please set TMOM_USERNAME and TMOM_PASSWORD in PAP/.env"
        )
    
    channel = _cfg("TMOM_CHANNEL", TMOM_CHANNEL) or "PC"
    url = f"{_tmom_base_url()}{_tmom_oauth_endpoint()}"
    # Browser-verified (2026-09-09 DevTools): the OAuth body is
    # multipart/form-data and the URL has NO query string. requests `files=`
    # forces multipart/form-data with an auto-generated boundary.
    multipart_files = {
        "username": (None, username),
        "password": (None, password),
        "grant_type": (None, "password"),
    }
    headers = {
        # Exact headers from the verified working T-MOM login script.
        "Accept": "application/json, text/plain, */*",
        "Origin": _tmom_base_url(),
        "Referer": _cfg("TMOM_REFERER", TMOM_REFERER),
        "User-Agent": "Mozilla/5.0",
        "p-appid": _cfg("TMOM_APP_ID", TMOM_APP_ID),
        "p-channel": channel,
        "p-requestid": str(uuid.uuid4()),
    }

    # NOTE (verified live 2026-09-09):
    # - multipart/form-data body + p-* headers matches the browser exactly.

    logger.info("T-MOM OAuth request started")

    try:
        # Reuse a session (keep-alive) exactly like the verified working script.
        with requests.Session() as session:
            response = session.post(
                url,
                files=multipart_files,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
                verify=TMOM_VERIFY_SSL,
            )

        logger.info(f"T-MOM OAuth response status: {response.status_code}")
        response.raise_for_status()
        
        data = response.json()
        
        # T-MOM returns code "200" on success. Fail when the code is
        # anything else OR when success is explicitly False.
        code = data.get("code")
        succ = data.get("success")
        if str(code) != "200" or succ is False:
            error_message = data.get("message", "Unknown OAuth error")
            error_code = data.get("code", "unknown")
            logger.error(f"T-MOM OAuth failed [{error_code}]: {error_message}")
            raise TMOMAuthenticationError(f"OAuth authentication failed: {error_message}")
        
        access_token = data.get('data', {}).get('access_token')
        
        if not access_token:
            raise TMOMAuthenticationError("No access token in OAuth response")
        
        logger.info("T-MOM OAuth authentication successful")
        return access_token
        
    except requests.exceptions.Timeout:
        logger.error("T-MOM OAuth request timed out")
        raise TMOMTimeoutError(f"OAuth request timed out after {REQUEST_TIMEOUT} seconds")
    
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to T-MOM OAuth endpoint")
        raise TMOMConnectionError("Failed to connect to T-MOM OAuth endpoint")
    
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response else 'unknown'
        logger.error(f"T-MOM OAuth HTTP error: {status_code}")
        raise TMOMAuthenticationError(f"OAuth HTTP error: {status_code}")
    
    except requests.exceptions.RequestException as e:
        logger.error(f"T-MOM OAuth request failed: {type(e).__name__}")
        raise TMOMError("Failed to authenticate with T-MOM")


def _get_auth_headers(access_token: str) -> Dict[str, str]:
    """Build authentication headers for T-MOM API."""
    return {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {access_token}',
        'Origin': _tmom_base_url(),
        'Referer': _cfg('TMOM_REFERER', TMOM_REFERER),
        'User-Agent': 'Mozilla/5.0',
        'p-appid': _cfg('TMOM_APP_ID', TMOM_APP_ID),
        'p-channel': _cfg('TMOM_CHANNEL', TMOM_CHANNEL),
        'p-requestid': str(uuid.uuid4()),
    }



# =============================================================================
# Main API Function
# =============================================================================


def fetch_fpy_data(
    start_time: str,
    end_time: str,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """Fetch FPY data from T-MOM API."""
    # Step 1: Get fresh access token
    logger.info("Fetching FPY data from T-MOM")
    access_token = _get_access_token()
    
    # Step 2: Build the request payload
    payload = {
        "processGroup": filters.get('process_group', 'ASSY') if filters else 'ASSY',
        "orderType": filters.get('order_type', 'ZP02') if filters else 'ZP02',
        "processCodeList": filters.get('process_codes', DEFAULT_PROCESS_CODES) if filters else DEFAULT_PROCESS_CODES,
        "boardNameList": [],
        "orderCodeList": filters.get('work_orders', []) if filters else [],
        "productLineCodeList": [],
        "projectNameList": filters.get('project_names', []) if filters else [],
        "queryType": "1",
        # Flag "0" = apply project filter; "1" = all projects.
        # Must be "0" whenever ANY of project_names or work_orders is specified;
        # "1" only when fetching everything (no restrictions).
        "selectAllProjectFlag": "0" if filters and (filters.get('project_names') or filters.get('work_orders')) else "1",
        "startTime": start_time,
        "endTime": end_time,
        "workgroupCode": ""
    }
    
    # Step 3: Build URL and headers
    url = f"{_tmom_base_url()}{_tmom_fpy_endpoint()}"
    headers = _get_auth_headers(access_token)
    
    logger.info(f"T-MOM FPY request started: {start_time} to {end_time}")
    logger.info(f"Authorization header present: {'Authorization' in headers}")
    
    try:
        # Step 4: Make the POST request (same session/SSL policy as login).
        with requests.Session() as session:
            response = session.post(
                url,
                json=payload,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
                verify=TMOM_VERIFY_SSL,
            )
        
        logger.info(f"T-MOM FPY response status: {response.status_code}")
        
        # Check for HTTP errors
        response.raise_for_status()
        
        # Parse response
        data = response.json()
        
        # Validate T-MOM FPY response (code 200 + success not False).
        ok_code = str(data.get("code")) == "200"
        if not ok_code or data.get("success") is False:
            error_message = data.get('message', 'Unknown T-MOM error')
            logger.error(f"T-MOM API error: {error_message}")
            raise TMOMError(f"T-MOM API error: {error_message}")
        
        logger.info("Successfully fetched FPY data from T-MOM")
        return data
        
    except requests.exceptions.Timeout:
        logger.error("T-MOM request timed out")
        raise TMOMTimeoutError(f"Request to T-MOM timed out after {REQUEST_TIMEOUT} seconds")
    
    except requests.exceptions.ConnectionError:
        logger.error("Failed to connect to T-MOM")
        raise TMOMConnectionError("Failed to connect to T-MOM API. Please check your network connection.")
    
    except requests.exceptions.HTTPError as e:
        status_code = e.response.status_code if e.response else 'unknown'
        logger.error(f"T-MOM HTTP error: {status_code}")
        
        if status_code == 401:
            raise TMOMAuthenticationError("Authentication failed. Please check your T-MOM credentials.")
        elif status_code == 403:
            raise TMOMAuthenticationError("Access forbidden. Please check your T-MOM permissions.")
        else:
            raise TMOMError(f"T-MOM HTTP error: {status_code}")
    
    except requests.exceptions.RequestException as e:
        logger.error(f"T-MOM request failed: {type(e).__name__}")
        raise TMOMError("Failed to communicate with T-MOM API")
    
    except ValueError as e:
        logger.error("Failed to parse T-MOM response")
        raise TMOMError("Invalid response received from T-MOM API")

