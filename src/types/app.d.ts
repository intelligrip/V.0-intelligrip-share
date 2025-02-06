
declare module "next/app" {
  export interface AppProps {
    Component: React.ComponentType<any>
    pageProps: any
  }
}
