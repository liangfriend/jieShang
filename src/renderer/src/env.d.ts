/// <reference types="vite/client" />

declare module '@renderer/toneColor/accoustic_grand_piano' {
  const toneColor: unknown
  export default toneColor
}

export {}

declare global {
  interface Window {
    api: {
      file: {
        upload(
          buffer: ArrayBuffer,
          originalName: string,
          type: 'image' | 'audio' | 'video',
          displayName: string
        ): Promise<{ name: string; type: string; url: string }>
        delete(url: string): Promise<{ success: boolean }>
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
        exportJson(
          content: string,
          defaultName?: string,
          title?: string
        ): Promise<{ canceled: boolean; filePath?: string }>
        importJson(title?: string): Promise<{
          canceled: boolean
          filePath?: string
          fileName?: string
          content?: string
        }>
      }
      omr: {
        recognize(image: Uint8Array): Promise<import('@renderer/types/omr').OmrRecognizeResult>
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
      audio: {
        create(payload: {
          name: string
          file: ArrayBuffer | Uint8Array
          originalName?: string
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(id: number | string, payload: Partial<{ name: string }>): Promise<any>
        get(id: number | string): Promise<any>
        query(filters: Partial<{ id: number | string; name: string }>): Promise<any>
        list(): Promise<any>
        searchByName(name: string): Promise<any>
      }
      image: {
        create(payload: {
          name: string
          file: ArrayBuffer | Uint8Array
          originalName?: string
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(id: number | string, payload: Partial<{ name: string }>): Promise<any>
        get(id: number | string): Promise<any>
        query(filters: Partial<{ id: number | string; name: string }>): Promise<any>
        list(): Promise<any>
        searchByName(name: string): Promise<any>
      }
      video: {
        create(payload: {
          name: string
          file: ArrayBuffer | Uint8Array
          originalName?: string
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(id: number | string, payload: Partial<{ name: string }>): Promise<any>
        get(id: number | string): Promise<any>
        query(filters: Partial<{ id: number | string; name: string }>): Promise<any>
        list(): Promise<any>
        searchByName(name: string): Promise<any>
      }
      guitarChord: {
        create(payload: {
          data: import('@deciphony/renderer').tabChord
          hand_pose?: {
            thumbF: number[]
            indexF: number[]
            middleF: number[]
            ringF: number[]
            littleF: number[]
          } | null
          tab_type?: 'tab4' | 'tab5' | 'tab6'
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(
          id: number | string,
          payload: {
            data: import('@deciphony/renderer').tabChord
            hand_pose?: {
              thumbF: number[]
              indexF: number[]
              middleF: number[]
              ringF: number[]
              littleF: number[]
            } | null
            tab_type?: 'tab4' | 'tab5' | 'tab6'
          }
        ): Promise<any>
        get(id: number | string): Promise<any>
        list(filter?: {
          keyword?: string
          tabType?: 'tab4' | 'tab5' | 'tab6' | 'all' | null
        }): Promise<any>
        searchByName(name: string, tabType?: 'tab4' | 'tab5' | 'tab6' | 'all' | null): Promise<any>
      }
      drumMachine: {
        create(payload: {
          name: string
          data: import('@renderer/types/drumMachine').DrumMachineData
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(
          id: number | string,
          payload: Partial<{
            name: string
            data: import('@renderer/types/drumMachine').DrumMachineData
          }>
        ): Promise<any>
        get(id: number | string): Promise<any>
        list(keyword?: string): Promise<any>
      }
      customSymbol: {
        create(payload: {
          name: string
          kind: import('@renderer/types/customSymbol').CustomSymbolKind
          data: import('@renderer/types/customSymbol').CustomSymbolData
        }): Promise<any>
        delete(id: number | string): Promise<any>
        update(
          id: number | string,
          payload: Partial<{
            name: string
            data: import('@renderer/types/customSymbol').CustomSymbolData
          }>
        ): Promise<any>
        list(kind?: import('@renderer/types/customSymbol').CustomSymbolKind): Promise<any>
      }
      group: {
        create(payload: any): Promise<any>
        delete(id: any): Promise<any>
        update(id: any, payload: any): Promise<any>
        query(filters: any): Promise<any>
        list(): Promise<any>
      }
      window: {
        open: (name: string, route: string, options: any) => void
        close: (name: string) => void
        focus: (name: string) => void
        get: (name: string) => void
      }
      collection: {
        create(payload: {
          type: 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'
          name?: string
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
            name: string
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
        listByType(type: 'tone_color' | 'score_skin' | 'piano_skin' | 'perform_skin'): Promise<any>
      }
      achievement: {
        list(): Promise<any>
        unlock(payload: { key: string; completed_at?: string }): Promise<any>
      }
      noteSliceHighScore: {
        list(): Promise<any>
        upsertIfHigher(
          mode: 'arcade' | 'endless' | 'extreme',
          difficulty: 'easy' | 'standard' | 'hard',
          score: number,
          notation?: 'staff' | 'jianpu'
        ): Promise<any>
      }
    }
  }
}
