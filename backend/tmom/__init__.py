"""
T-MOM integration package for PAP (Production Analytics Platform).

This package provides the integration layer between PAP and T-MOM
for First Pass Yield (FPY) data.

Architecture:
    T-MOM
      |
      v POST
    tmom_client.py
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

from .fpy_service import get_fpy_data
from .ng_ndf_service import get_ng_ndf_matrix
from .tmom_client import TMOMError, TMOMAuthenticationError, TMOMConnectionError, TMOMTimeoutError

__all__ = [
    'get_fpy_data',
    'get_ng_ndf_matrix',
    'TMOMError',
    'TMOMAuthenticationError',
    'TMOMConnectionError',
    'TMOMTimeoutError',
]
