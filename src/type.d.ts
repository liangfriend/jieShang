export {}

declare global {
  interface Window {
    api: {
      game: {
        create(payload: any): Promise<any>
        delete(id: any): Promise<any>
        update(id: any, payload: any): Promise<any>
        query(filters: any): Promise<any>
        list(): Promise<any>
      }
      file: {
        upload(buffer: any, originalName: string, type: string, displayName: string): Promise<any>
        delete(id: any): Promise<any>
        query(query: any): Promise<any>
        importSj(): Promise<{
          canceled: boolean
          filePath?: string
          fileName?: string
          content?: string
        }>
        exportSj(
          content: string,
          defaultName?: string
        ): Promise<{ canceled: boolean; filePath?: string }>
        importMusicXml(): Promise<{
          canceled: boolean
          filePath?: string
          fileName?: string
          content?: string
        }>
        exportMusicXml(
          content: string,
          defaultName?: string
        ): Promise<{ canceled: boolean; filePath?: string }>
      }
      resource: {
        create(payload: any): Promise<any>
        delete(id: any): Promise<any>
        update(id: any, payload: any): Promise<any>
        query(filters: any): Promise<any>
        list(): Promise<any>
      }
      save: {
        create(payload: any): Promise<any>
        delete(id: any): Promise<any>
        update(id: any, payload: any): Promise<any>
        query(filters: any): Promise<any>
        list(): Promise<any>
      }
      score: {
        create(payload: { name: string; data?: string }): Promise<any>
        delete(id: number | string): Promise<any>
        update(id: number | string, payload: Partial<{ name: string; data: string }>): Promise<any>
        get(id: number | string): Promise<any>
        query(filters: Partial<{ id: number | string; name: string }>): Promise<any>
        list(): Promise<any>
        searchByName(name: string): Promise<any>
      }
      work: {
        create(payload: {
          name: string
          score_id?: number | null
          data?: string
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(
          id: number | string,
          payload: Partial<{ name: string; score_id: number | null; data: string }>
        ): Promise<any>
        get(id: number | string, includeScore?: boolean): Promise<any>
        query(
          filters: Partial<{ id: number | string; name: string; score_id: number }>
        ): Promise<any>
        list(): Promise<any>
        searchByName(name: string): Promise<any>
        extractScore(id: number | string): Promise<any>
      }
      collection: {
        create(payload: {
          type: 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'
          content?: string
          description?: string | null
          is_built_in?: boolean
          owned?: boolean
          level?: number
          thumbnail?: string | null
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(
          id: number | string,
          payload: Partial<{
            type: 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'
            content: string
            description: string | null
            is_built_in: boolean
            owned: boolean
            level: number
            thumbnail: string | null
          }>
        ): Promise<any>
        get(id: number | string): Promise<any>
        query(
          filters: Partial<{
            id: number | string
            type: 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'
            is_built_in: boolean
            owned: boolean
          }>
        ): Promise<any>
        list(): Promise<any>
        listByType(
          type: 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'
        ): Promise<any>
      }
      achievement: {
        list(): Promise<{ success: boolean; data?: Array<{ id: number; key: string; completed_at: string }> }>
        unlock(payload: { key: string; completed_at?: string }): Promise<any>
      }
      noteSliceHighScore: {
        list(): Promise<{
          success: boolean
          data?: Array<{
            id: number
            mode: 'arcade' | 'endless' | 'extreme'
            difficulty: 'easy' | 'standard' | 'hard'
            high_score: number
          }>
        }>
        upsertIfHigher(
          mode: 'arcade' | 'endless' | 'extreme',
          difficulty: 'easy' | 'standard' | 'hard',
          score: number
        ): Promise<any>
      }
      window: {
        open(name: string, route: string, options?: Record<string, unknown>): void
        close(name: string): void
        focus(name: string): void
        get(name: string): void
      }
    }
  }
}
