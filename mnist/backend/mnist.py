import tensorflow as tf
from tensorflow.keras.datasets import mnist
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Flatten, Conv2D, MaxPooling2D, Dropout
from tensorflow.keras.optimizers import Adam

# Load and preprocess MNIST data
(x_train, y_train), (x_test, y_test) = mnist.load_data()

# Normalize the data and reshape to add a channel dimension (grayscale images)
x_train = x_train[..., tf.newaxis] / 255.0
x_test = x_test[..., tf.newaxis] / 255.0

# Build the model with convolutional layers
model = Sequential([

    # First convolutional layer with 32 filters, 3x3 kernel, and ReLU activation
    Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    MaxPooling2D((2, 2)),  # Max pooling to reduce spatial dimensions

    # Second convolutional layer with 64 filters, 3x3 kernel, and ReLU activation
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),  # Max pooling again

    # Third convolutional layer with 128 filters, 3x3 kernel, and ReLU activation
    Conv2D(128, (3, 3), activation='relu'),
    MaxPooling2D((2, 2)),  # Max pooling again

    # Flatten the output to feed into dense layers
    Flatten(),
    
    # First dense layer with 25 neurons and sigmoid activation
    Dense(25, activation='sigmoid'),

    # Second dense layer with 25 neurons and sigmoid activation
    Dense(25, activation='sigmoid'),

    # Output layer with 10 neurons (for 10 classes) and softmax activation
    Dense(10, activation='softmax')
])

# Compile the model
model.compile(optimizer=Adam(), loss='sparse_categorical_crossentropy', metrics=['accuracy'])

# Train the model
model.fit(x_train, y_train, epochs=5, batch_size=32, validation_data=(x_test, y_test))

# Save the model
model.save("mnist_cnn_with_dense_layers.h5")
