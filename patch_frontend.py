import io
from pathlib import Path
p = Path(__file__).resolve().parent.parent / 'frontend' / 'src' / 'assembly' / 'AssemblyFPY.jsx'
t = open(p, encoding='utf-8').read()
old_kpi = '    const totalStarts = data.reduce((sum, item) => sum + (item.productionStarts || 0), 0);\n    const totalGood = data.reduce((sum, item) => sum + (item.goodProducts || 0), 0);\n    const totalDefects = data.reduce((sum, item) => sum + (item.defects || 0), 0);\n    const totalFalseDetections = data.reduce((sum, item) => sum + (item.falseDetections || 0), 0);\n    const overallFPY = totalStarts > 0 ? (totalGood / totalStarts) * 100 : 0;\n    const overallRTY = data.length > 0 ? data.reduce((sum, item) => sum + (item.overallRTY || 0), 0) / data.length : 0;'
assert old_kpi in t, 'kpi block not found'
new_kpi = '''    const num = (v) => Number(v) || 0;
    const startsOf = (item) => num(item.productionStarts ?? item.numberOfProductionStarts);
    const goodOf = (item) => num(item.goodProducts ?? item.numberOfGoodProducts);
    const defectsOf = (item) => num(item.defects ?? item.numberOfDefects);
    const falseDetOf = (item) => num(item.falseDetections ?? item.numberOfFalseDetections);
    const rtyOf = (item) => num(item.overallRTY ?? item.overallFirstPassYieldRTY);
    const totalStarts = data.reduce((sum, item) => sum + startsOf(item), 0);
    const totalGood = data.reduce((sum, item) => sum + goodOf(item), 0);
    const totalDefects = data.reduce((sum, item) => sum + defectsOf(item), 0);
    const totalFalseDetections = data.reduce((sum, item) => sum + falseDetOf(item), 0);
    const overallFPY = totalStarts > 0 ? (totalGood / totalStarts) * 100 : 0;
    const overallRTY = data.length > 0 ? data.reduce((sum, item) => sum + rtyOf(item), 0) / data.length : 0;'''
t = t.replace(old_kpi, new_kpi)

repls = [
    ('projectMap[name].productionStarts += item.productionStarts || 0;\n        projectMap[name].goodProducts += item.goodProducts || 0;',
     'projectMap[name].productionStarts += Number(item.productionStarts ?? item.numberOfProductionStarts) || 0;\n        projectMap[name].goodProducts += Number(item.goodProducts ?? item.numberOfGoodProducts) || 0;'),
    ('processMap[name].starts += item.productionStarts || 0;\n        processMap[name].good += item.goodProducts || 0;\n        processMap[name].defects += item.defects || 0;\n        processMap[name].falseDetections += item.falseDetections || 0;',
     'processMap[name].starts += Number(item.productionStarts ?? item.numberOfProductionStarts) || 0;\n        processMap[name].good += Number(item.goodProducts ?? item.numberOfGoodProducts) || 0;\n        processMap[name].defects += Number(item.defects ?? item.numberOfDefects) || 0;\n        processMap[name].falseDetections += Number(item.falseDetections ?? item.numberOfFalseDetections) || 0;'),
    ('projectMap[name].starts += item.productionStarts || 0;\n        projectMap[name].good += item.goodProducts || 0;\n        projectMap[name].defects += item.defects || 0;\n        projectMap[name].falseDetections += item.falseDetections || 0;',
     'projectMap[name].starts += Number(item.productionStarts ?? item.numberOfProductionStarts) || 0;\n        projectMap[name].good += Number(item.goodProducts ?? item.numberOfGoodProducts) || 0;\n        projectMap[name].defects += Number(item.defects ?? item.numberOfDefects) || 0;\n        projectMap[name].falseDetections += Number(item.falseDetections ?? item.numberOfFalseDetections) || 0;'),
]
for old, new in repls:
    if old in t:
        t = t.replace(old, new)
open(p, 'w', encoding='utf-8', newline='').write(t)
print('frontend kpi/agg patched')
