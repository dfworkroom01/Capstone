import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load the dataset
data = pd.read_csv('water_data.csv')

# Features (water_level, rainfall, temperature)
X = data[['water_level', 'rainfall', 'temperature']]

# Target variable (drought_risk)
y = data['drought_risk']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Train a Random Forest Classifier model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Evaluate the model
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

# Save the trained model
joblib.dump(model, 'drought_model.pkl')

print(f'Model trained with accuracy: {accuracy}')
