export default {
  myAudio: {
    title: 'My audio',
    searchPlaceholder: 'Search by name',
    empty: 'No audio yet — tap Add to upload',
    emptyFiltered: 'No matching audio',
    add: 'Add audio',
    uploading: 'Uploading…',
    uploadSuccess: 'Added {n} audio file(s)',
    uploadFailed: 'Upload failed',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    seek: 'Seek',
    deleteTitle: 'Delete audio',
    deleteMessage: 'Delete this audio file?',
    deleteWarning: ' This cannot be undone.',
    deleteSuccess: 'Audio deleted',
    deleteAria: 'Delete audio',
    detail: {
      title: 'Audio details',
      duration: 'Duration',
      sampleRate: 'Sample rate',
      sampleRateValue: '{hz} Hz',
      channels: 'Channels',
      channelsValue: '{n}',
      size: 'File size',
      format: 'Format',
      createdAt: 'Added',
      probeFailed: 'Could not read metadata (unsupported codec?)'
    }
  }
} as const
