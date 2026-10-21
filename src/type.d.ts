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
        importClSheet(): Promise<{
          canceled: boolean
          filePath?: string
          fileName?: string
          content?: string
        }>
        exportClSheet(
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
        importMidi(): Promise<{
          canceled: boolean
          filePath?: string
          fileName?: string
          content?: Uint8Array
        }>
        exportMidi(
          content: Uint8Array,
          defaultName?: string
        ): Promise<{ canceled: boolean; filePath?: string }>
      }
      omr: {
        recognize(image: Uint8Array): Promise<any>
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
        create(payload: {
          name: string
          data?: string
          type?: 'music_score' | 'cl_sheet'
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(id: number | string, payload: Partial<{ name: string; data: string }>): Promise<any>
        get(id: number | string): Promise<any>
        query(
          filters: Partial<{ id: number | string; name: string; type: 'music_score' | 'cl_sheet' }>
        ): Promise<any>
        list(type?: 'music_score' | 'cl_sheet'): Promise<any>
        searchByName(name: string, type?: 'music_score' | 'cl_sheet'): Promise<any>
      }
      work: {
        create(payload: {
          name: string
          file: ArrayBuffer | Uint8Array
          score_id?: number | null
          originalName?: string
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(
          id: number | string,
          payload: Partial<{
            name: string
            score_id: number | null
            file: ArrayBuffer | Uint8Array
          }>
        ): Promise<any>
        get(id: number | string, includeScore?: boolean): Promise<any>
        query(
          filters: Partial<{ id: number | string; name: string; score_id: number }>
        ): Promise<any>
        list(): Promise<any>
        searchByName(name: string): Promise<any>
        extractScore(id: number | string): Promise<any>
      }
      guitarChord: {
        create(payload: { data: any; hand_pose?: any; tab_type?: 'tab4' | 'tab6' }): Promise<any>
        delete(id: number | string): Promise<any>
        update(id: number | string, payload: { data: any; hand_pose?: any }): Promise<any>
        get(id: number | string): Promise<any>
        list(filter?: {
          keyword?: string
          tabType?: 'tab4' | 'tab6' | 'all' | null
        }): Promise<any>
        searchByName(
          name: string,
          tabType?: 'tab4' | 'tab6' | 'all' | null
        ): Promise<any>
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
          option?: string
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
            option: string
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
            notation: 'staff' | 'jianpu'
            high_score: number
          }>
        }>
        upsertIfHigher(
          mode: 'arcade' | 'endless' | 'extreme',
          difficulty: 'easy' | 'standard' | 'hard',
          score: number,
          notation?: 'staff' | 'jianpu'
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
