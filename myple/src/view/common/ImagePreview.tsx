import { useState } from "react";
import { TEXT } from "../../common/constants";
import styled from "styled-components"

export const ImagePreviewContainer = styled.div`
    display: flex;
    flex-wrap: nowrap;  // 여러 줄로 나뉘어 배치
    gap:10px;        // 아이템 간 간격
    overflow-x: auto; // 가로 스크롤 가능
    scroll-behavior: smooth; // 부드러운 스크롤
    padding: 8px;
    background-color: #fff;
    width: 100%;
    box-sizing: border-box;
`;

const ImageWrapper = styled.div`
    position: relative;
    display: flex;
    cursor: pointer;
    border-radius: 8px;
    overflow: hidden;
    background-color: #f0f0f0;
    flex-shrink: 0;             /* 컨테이너가 줄어들지 않도록 방지 */
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  fontSize: 14px;
  lineHeight: 1;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 0,0, 0.7);
  }
`;


interface ImagePreviewProps {
    src: string;
    id: string;
    onClick: () => void;
    onDelete: ((id: string) => void) | null
}


const SIZE_LARGE = 300;
const SIZE_SMALL = 100;
const ImagePreview = ({ src, id, onClick, onDelete }: ImagePreviewProps) => {
    const [size, setSize] = useState<number>(SIZE_SMALL); // 기본 250px
    const toggleSize = () => {
        setSize((prev) => (prev === SIZE_LARGE ? SIZE_SMALL : SIZE_LARGE));
    };

    return (
        <ImageWrapper
            style={{
                width: size,
                height: size,
            }}
            onClick={(e) => {
                toggleSize();
                onClick();
                e.stopPropagation()
            }}
        >
            {/* 실제 이미지 */}
            <img
                src={src}
                alt=""
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />

            {/* 삭제 버튼 (오른쪽 상단) */}
            {onDelete && <DeleteButton
                type="button"
                onClick={(e) => {
                    e.stopPropagation(); // 이미지 클릭 이벤트 방지
                    const confirmDelete = async () => {
                        if (window.confirm(TEXT.MSG_IMAGE_DELETE)) {
                            onDelete(id);
                        }
                    };
                    confirmDelete();
                }}
                title={TEXT.DELETE}
            >
                ×
            </DeleteButton>
            }
        </ImageWrapper>
    );
};

export default ImagePreview