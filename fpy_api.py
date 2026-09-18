from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import logging

from tmom import get_fpy_data

logger = logging.getLogger(__name__)


@csrf_exempt
def fpy_data(request):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed. Use GET.', 'data': []}, status=405)

    start_time = request.GET.get('startTime')
    end_time = request.GET.get('endTime')

    filters = {}

    # processSection (frontend) == processGroup (T-MOM); accept either name
    process_section = request.GET.get('processSection') or request.GET.get('processGroup')
    if process_section:
        filters['process_group'] = process_section

    order_type = request.GET.get('orderType')
    if order_type:
        filters['order_type'] = order_type

    process_codes = request.GET.get('processCodes')
    if process_codes:
        filters['process_codes'] = [c.strip() for c in process_codes.split(',') if c.strip()]

    # Process display-names (e.g. ANTWBG) - post-filtered server-side in fpy_service
    process_names = request.GET.get('processNames')
    if process_names:
        filters['process_names'] = [n.strip() for n in process_names.split(',') if n.strip()]

    project_names = request.GET.get('projectNames')
    if project_names:
        filters['project_names'] = [n.strip() for n in project_names.split(',') if n.strip()]

    # ROOT CAUSE FIX: workOrders was never read so T-MOM always got orderCodeList=[]
    work_orders = request.GET.get('workOrders')
    if work_orders:
        filters['work_orders'] = [w.strip() for w in work_orders.split(',') if w.strip()]

    result = get_fpy_data(
        start_time=start_time,
        end_time=end_time,
        filters=filters if filters else None,
    )

    if result['success']:
        return JsonResponse({
            'success': True,
            'source': 'T-MOM',
            'data': result['data'],
            'count': result['count'],
            'summary': result.get('summary', {}),
            'metadata': result['metadata'],
            'status': 'success',
        })

    error_type = result.get('error', 'internal_error')
    message = result.get('message', '')
    if error_type == 'authentication_error':
        if 'credentials not configured' in message.lower():
            status_code = 503
            display_message = (
                'T-MOM credentials are not configured. '
                'Please set TMOM_USERNAME and TMOM_PASSWORD in PAP/.env.'
            )
        else:
            status_code = 502
            display_message = (
                'T-MOM authentication failed (upstream). '
                'Django is running but T-MOM rejected the credentials/token. Details: ' + message
            )
    elif error_type == 'tmom_error':
        status_code = 502
        # T-MOM returns this when filters are valid but no data matches
        # (e.g. work order has no production in the selected date window)
        if '数据不存在' in message or 'not exist' in message.lower() or 'no data' in message.lower():
            display_message = (
                'No production data found for the selected filters in this date window. '
                'Try widening the date range (e.g. Last 2 Days) or selecting a different work order.'
            )
        else:
            display_message = 'T-MOM API error (upstream). Details: ' + message
    else:
        status_code = 500
        display_message = message or 'Internal error'

    return JsonResponse({
        'success': False,
        'source': 'T-MOM',
        'error': error_type,
        'message': display_message,
        'data': [],
        'count': 0,
        'summary': result.get('summary', {}),
        'status': 'error',
    }, status=status_code)
