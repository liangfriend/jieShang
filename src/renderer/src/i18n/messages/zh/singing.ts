export default {
  singing: {
    toolbar: {
      start: '开始检测',
      stop: '停止'
    },
    meta: {
      bpm: 'BPM',
      notes: '音符',
      detecting: '检测中',
      countdown: '准备中'
    },
    waterfall: {
      reference: '标准音',
      sung: '已唱',
      livePitch: '实时音高'
    },
    result: {
      title: '演唱测评结果',
      subtitle: '根据音准、节奏与完整度综合评估',
      pitch: '音准',
      rhythm: '节奏',
      completeness: '完整度',
      ok: '知道了',
      gradeS: '出色！',
      gradeA: '很好',
      gradeB: '不错',
      gradeC: '继续加油',
      gradeD: '再试一次'
    },
    messages: {
      noSequence: '当前没有可测评的音符序列',
      notationTypeSwitchFailed: '曲谱类型切换失败',
      audioMissing: '未找到可播放的范唱或伴奏音频'
    }
  }
} as const
