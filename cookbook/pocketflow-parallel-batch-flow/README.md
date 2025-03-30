# Image Filter Application

This application applies image filters to multiple images in parallel using PocketFlow's ParallelBatchFlow pattern.

## Features

- Processes all images in the `src/images` directory
- Applies three filters to each image: blur, grayscale, and sepia
- Processes images in parallel batches for maximum efficiency
- Saves processed images to the `output` directory with naming pattern `originalName_filterName`
- Generates a report of all processed images
- Uses Sharp for high-performance image processing in Node.js

## Prerequisites

- Node.js (v14 or later)
- npm

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

1. Place your images in the `src/images` directory
2. Run the application:

```bash
npm run build
node dist/image_filter_app.js
```

## Implementation Details

The application demonstrates the use of the ParallelBatchFlow pattern from PocketFlow. It consists of three main components:

1. **Image Scanner Node**: Scans the `src/images` directory for image files
2. **Image Processing Node**: Uses ParallelBatchFlow to apply filters to images in parallel using Sharp
3. **Completion Report Node**: Generates a report of all processed images

## Configuration

You can adjust the batch size and concurrency level in the `ImageProcessingFlow` constructor:

```typescript
// 5 images per batch, 3 parallel batches
const processingFlow = new ImageProcessingFlow(5, 3);
```

## Output

- Processed images are saved to the `output` directory with naming pattern `originalName_filterName`
- A report file `report.txt` is generated in the `output` directory

## Example

If you have an image `cat.jpg` in the `src/images` directory, you will get three processed images in the `output` directory:

- `cat_blur.jpg`
- `cat_grayscale.jpg`
- `cat_sepia.jpg`

## Image Processing Details

The application uses the Sharp library to apply the following filters:

- **Blur**: Applies a Gaussian blur with radius 5
- **Grayscale**: Converts the image to grayscale
- **Sepia**: Applies a sepia tone effect using a color matrix
