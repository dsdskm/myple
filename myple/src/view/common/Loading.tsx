import { Loader } from "@toss/tds-mobile"

const Loading = () => {
    return <div style={{ display: 'flex', flex: 1, justifyContent: "center", alignItems: "center", height: "100vh" }} >
        <Loader size="large" />
    </div >
}

export default Loading