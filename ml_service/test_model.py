import joblib

v = joblib.load('models/vectorizer.pkl')
m = joblib.load('models/model.pkl')

tests = [
    ("SpaceX successfully launches cargo mission to the International Space Station.", "Real"),
    ("Scientists discover new species of deep-sea jellyfish in the Mariana Trench.", "Real"),
    ("Federal Reserve keeps interest rates unchanged at quarterly meeting.", "Real"),
    ("New medical trial shows promising results for early-stage Alzheimer treatment.", "Real"),
    ("National soccer team advances to finals after thrilling 2-1 victory.", "Real"),
    ("World Athletics Championship sets new participation record with 3000 athletes.", "Real"),
    ("University researchers develop new biodegradable material to replace plastics.", "Real"),
    ("Electric vehicle sales reach record highs in Europe during third quarter.", "Real"),
    ("Drinking bleach cures all viral infections instantly doctors confirm.", "Fake"),
    ("NASA admits all space launches are filmed in a Hollywood studio.", "Fake"),
    ("Secret miracle cure for cancer suppressed by pharmaceutical companies.", "Fake"),
    ("5G towers alter human DNA and control thoughts scientists reveal.", "Fake"),
    ("Billionaire secretly buys all water sources to charge air tax.", "Fake"),
    ("Government secretly adding mind control chemicals to tap water supplies.", "Fake"),
    ("Miracle plant extract restores lost sight in 12 hours.", "Fake"),
]

print("=" * 110)
print(f"{'Article':<72} {'Expected':<9} {'Got':<9} {'Conf':>6}  Match")
print("=" * 110)

correct = 0
for text, expected in tests:
    vec = v.transform([text])
    pred = m.predict(vec)[0]
    proba = m.predict_proba(vec)[0]
    conf = max(proba) * 100
    match = "OK" if pred == expected else "WRONG"
    if pred == expected:
        correct += 1
    print(f"{text[:70]:<72} {expected:<9} {pred:<9} {conf:>5.0f}%  {match}")

print("=" * 110)
print(f"\nResult: {correct}/{len(tests)} correct ({correct/len(tests)*100:.0f}%)")
