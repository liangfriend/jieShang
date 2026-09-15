export default {
  myImage: {
    title: 'My images',
    searchPlaceholder: 'Search by name',
    empty: 'No images yet — tap Add to upload',
    emptyFiltered: 'No matching images',
    add: 'Add image',
    uploading: 'Uploading…',
    uploadSuccess: 'Added {n} image(s)',
    uploadFailed: 'Upload failed',
    deleteTitle: 'Delete image',
    deleteMessage: 'Delete this image?',
    deleteWarning: ' This cannot be undone.',
    deleteSuccess: 'Image deleted',
    deleteAria: 'Delete image',
    detail: {
      title: 'Image details',
      dimensions: 'Dimensions',
      dimensionsValue: '{w} × {h}',
      size: 'File size',
      format: 'Format',
      createdAt: 'Added',
      probeFailed: 'Could not read image info'
    }
  }
} as const
