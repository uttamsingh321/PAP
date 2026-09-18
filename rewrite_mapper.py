import io
p = 'tmom/fpy_mapper.py'
t = open(p, encoding='utf-8').read()
old = 'def _safe_string'
assert old in t
helper = (
    'def _first_present(record, *keys, default=None):\n'
    '    for k in keys:\n'
    '        if k in record and record.get(k) is not None:\n'
    '            return record.get(k)\n'
    '    return default\n'
    '\n\n'
)
if '_first_present' not in t:
    t = t.replace(old, helper + old)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('helper inserted')
