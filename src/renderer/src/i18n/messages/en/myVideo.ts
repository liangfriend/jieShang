export default {
  myVideo: {
    title: 'My videos',
    searchPlaceholder: 'Search by name',
    empty: 'No videos yet — tap Add to upload',
    emptyFiltered: 'No matching videos',
    add: 'Add video',
    uploading: 'Uploading…',
    uploadSuccess: 'Added {n} video(s)',
    uploadFailed: 'Upload failed',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    seek: 'Seek',
    deleteTitle: 'Delete video',
    deleteMessage: 'Delete this video?',
    deleteWarning: ' This cannot be undone.',
    deleteSuccess: 'Video deleted',
    deleteAria: 'Delete video',
    detail: {
      title: 'Video details',
      duration: 'Duration',
      dimensions: 'Resolution',
      dimensionsValue: '{w} × {h}',
      size: 'File size',
      format: 'Format',
      createdAt: 'Added',
      probeFailed: 'Could not read video info'
    }
  }
} as const
