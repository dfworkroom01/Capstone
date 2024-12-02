import pandas as pd

# Define the data
data = {
    'water_level': [85, 60, 45, 80, 50, 70, 90, 65, 40, 75, 55, 80, 48, 82, 68, 72, 54, 77, 52, 66],
    'rainfall': [200, 150, 100, 180, 120, 160, 210, 140, 80, 170, 110, 190, 95, 185, 155, 165, 105, 175, 115, 145],
    'temperature': [25, 28, 30, 22, 33, 26, 20, 27, 35, 24, 32, 21, 34, 23, 28, 27, 31, 22, 30, 29],
    'drought_risk': ['low', 'moderate', 'high', 'low', 'high', 'moderate', 'low', 'moderate', 'high', 'low', 'high', 'low', 'high', 'low', 'moderate', 'moderate', 'high', 'low', 'high', 'moderate']
}

# Create a DataFrame
df = pd.DataFrame(data)

# Save to CSV
df.to_csv('water_data.csv', index=False)

print("water_data.csv file has been created.")
