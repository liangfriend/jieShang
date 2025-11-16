/// <reference types="vite/client" />
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
      work: {
        create(payload: any): Promise<any>
        delete(id: any): Promise<any>
        update(id: any, payload: any): Promise<any>
        query(filters: any): Promise<any>
        list(): Promise<any>
      }
    }
  }
}
