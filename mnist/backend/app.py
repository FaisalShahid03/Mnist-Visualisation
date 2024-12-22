from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)

CORS(app)

# Load the pre-trained model
model = tf.keras.models.load_model("mnist_cnn_with_dense_layers.h5")
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Preprocess input image and extract layer outputs
def process_image(data):
    # Ensure the data has 784 elements (28x28)
    if len(data) != 784:
        return {"error": "Data must have exactly 784 elements."}

    # Reshape the data into a 28x28 2D array
    input_image = np.array(data).reshape(28, 28)

    # Preprocess the sample image (28x28)
    input_image = input_image[..., tf.newaxis]  # Add channel dimension for grayscale (28, 28, 1)
    input_image = input_image / 255.0  # Normalize the image to [0, 1]
    input_image = np.expand_dims(input_image, axis=0)  # Add batch dimension (1, 28, 28, 1)

    # Identify and process all layers (Conv2D, MaxPooling2D, Dense)
    conv_output = input_image  # Initialize with the input image
    conv_layer_count = 0
    layer_outputs = {}

    # Process Conv2D and MaxPooling2D layers
    for layer_index, layer in enumerate(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D) or isinstance(layer, tf.keras.layers.MaxPooling2D):
            # Apply the convolutional or pooling layer
            conv_output = layer(conv_output)  # Forward pass through the layer
            layer_outputs[f"conv_layer{conv_layer_count}_output"] = conv_output.numpy()  # Store output
            conv_layer_count += 1

    # Flatten the convolutional output before passing to dense layers
    flattened_output = tf.keras.layers.Flatten()(conv_output).numpy()

    # Process Dense layers and store the output of the last three dense layers
    dense_layer_count = 0
    dense_outputs = []

    for layer_index, layer in enumerate(model.layers):
        if isinstance(layer, tf.keras.layers.Dense):
            # Extract weights and biases
            weights, biases = layer.get_weights()

            # Apply the dense layer manually
            dense_output = np.dot(flattened_output, weights) + biases

            # Apply activation function
            if layer_index == len(model.layers) - 1:  # Last layer
                layer_output_activated = tf.nn.softmax(dense_output).numpy()  # Softmax activation
            else:
                layer_output_activated = tf.nn.sigmoid(dense_output).numpy()  # ReLU activation for intermediate layers

            # Store the output of this dense layer
            dense_outputs.append(layer_output_activated)

            flattened_output = layer_output_activated  # Output of the current layer becomes input for the next layer
            dense_layer_count += 1

            # Stop after processing the last three dense layers
            if dense_layer_count >= 3:
                break

    return dense_outputs


# Define the prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get the JSON data from the request
        data = request.json.get('input')
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Ensure data is a valid list of 784 integers
        if not isinstance(data, list) or len(data) != 784:
            return jsonify({"error": "Data must be a list of 784 integers."}), 400
        
        # Get the outputs of the last three dense layers
        result = process_image(data)
        print(result)
        # Convert the arrays to lists if they're not already
        dense_layer_outputs_list = [array.tolist() for array in result]

        # Return as a JSON response
        return jsonify({
            "dense_layer_outputs": dense_layer_outputs_list
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)