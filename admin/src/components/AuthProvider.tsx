import { useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/libs/firebase";
import { useAuth } from "@/store/auth";
import { Spin } from "antd";
import styled from "styled-components";
import { TEXT } from "@/constants/texts";

const FullCenter = styled.div`
  height: 100vh;
  display: grid;
  place-items: center;
`;

function toAppUser(u: User | null) {
  if (!u) return null;
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  };
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialized, setInitialized, setUser } = useAuth();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(toAppUser(u));
      setInitialized(true);
    });
    return () => unsub();
  }, [setInitialized, setUser]);

  if (!initialized) {
    return (
      <FullCenter>
        <Spin tip={TEXT.LOADING} size="large" >
          <div style={{ width: "100vw", height: 0 }} />
        </Spin>
      </FullCenter >

    );
  }

  return <>{children}</>;
}