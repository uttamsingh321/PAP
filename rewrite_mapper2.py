import io
p = 'tmom/fpy_mapper.py'
lines = open(p, encoding='utf-8').read().splitlines()
start = next(i for i, l in enumerate(lines) if l.startswith('def map_tmom_record'))
# end = start of next top-level def after map_tmom_record
nxt = next(i for i in range(start + 1, len(lines)) if lines[i].startswith('def '))
new_block = '''def map_tmom_record(record: Dict[str, Any]) -> Dict[str, Any]:
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
        _first_present(record, "productionLine", "productLine", "lineName", "line", "production_line"))
    team = _safe_string(
        _first_present(record, "team", "teamName", "workgroup", "workgroupCode", "workGroup"))

    starts = _safe_int(_first_present(
        record, "productionStarts", "numberOfProductionStarts",
        "production_starts", "startQty", "inputQty", "inQty"))
    good = _safe_int(_first_present(
        record, "goodProducts", "numberOfGoodProducts",
        "good_products", "goodQty", "okQty", "passQty"))
    defects = _safe_int(_first_present(
        record, "defects", "numberOfDefects", "defectQty", "ngQty", "failQty"))
    false_det = _safe_int(_first_present(
        record, "falseDetections", "numberOfFalseDetections",
        "false_detections", "falseDetQty", "misjudgeQty"))
    defect_rate = _safe_float(_first_present(
        record, "defectRate", "defect_rate"))
    false_rate = _safe_float(_first_present(
        record, "falseDetectionRate", "false_detection_rate", "falseDetRate"))
    fpy = _safe_float(_first_present(
        record, "firstPassYield", "fpy", "first_pass_yield", "fty"))
    fpy_alias = _safe_float(_first_present(record, "fpy", "firstPassYield"))
    rty = _safe_float(_first_present(
        record, "overallRTY", "overallFirstPassYieldRTY", "rty", "overallFpy", "overall_yield"))
    record_date = _safe_string(_first_present(
        record, "recordDate", "statDate", "workDate", "productionDate", "date", "createTime"))

    return {
        # T-MOM terminology (canonical)
        "processSection": process_section,
        "projectName": project_name,
        "workOrderType": work_order_type,
        "processName": process_name,
        "processCode": process_code,
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
    }'''
lines[start:nxt] = new_block.splitlines()
open(p, 'w', encoding='utf-8', newline='').write('\n'.join(lines) + '\n')
print('map_tmom_record replaced')
