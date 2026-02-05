import { Loader, } from "@toss/tds-mobile"
import styled from "styled-components"

const LoadingWrapper = styled.div`
    display:flex;
    flex:1;
    justify-content:center;
    align-items:center;
    height:100vh;
`

const Loading = ({ label }: { label: string }) => {
    return <LoadingWrapper>
        <Loader size="large" label={label} />
    </LoadingWrapper>
}


export default Loading