import Image from "next/image";
import React from "react";

export default function FixedBottomIconBar() {
    const wrapperStyle: React.CSSProperties = {
        left: '13px',
        bottom: '13px'
    };


    const circleStyle: React.CSSProperties = {
        background: '#465b5d'
    };
    return (
        <>
            {/* // <div
        //     id="hu-revoke"
        //     role="dialog"
        //     className="hu-wrapper hu-position-bottom-left hu-animation-fade"
        //     style={{
        //         bottom: '25px',
        //         left: '25px',
        //         color: '#434f58',
        //         backgroundColor: '#465b5d',
        //         cursor: 'pointer',
        //         width: `200px`,
        //         height: `100px`,
        //         zIndex: 1049,
        //         position: "fixed",
        //         display: "block",
        //     }}
        // >
        //     <button
        //         className="hu-revoke-button"
        //         type="button"
        //         data-hu-action="cookies-notice-revoke"
        //         data-hu-listener="true"
        //         style={{
        //             backgroundColor: '#465b5d',
        //             color: textColor,
        //             width: `0px`,
        //             height: `50px`,
        //             minWidth: `50px`,
        //             minHeight: `50px`,
        //             padding: `8px`,
        //             borderRadius: "50px",
        //             border: "none",
        //             outline: "none",
        //             boxShadow: "none",
        //             display: "inline-flex",
        //             alignItems: "center",
        //             justifyContent: "center",
        //             cursor: "pointer",
        //         }}
        //     >

        //         <img
        //             src="/img/fingur.svg"
        //             alt="Logo"
        //             className="pe-3"
        //             style={{ height: '100px', width: '100px', borderRadius: '50px' }}
        //             decoding="async"
        //         />
        //     </button >
        // </div> */}

            {/* Accessibility button (uai) */}
            <div
                id="userwayAccessibilityIcon"
                role="button"
                tabIndex={0}
                aria-haspopup="dialog"
                aria-label="Accessibility Menu"
                title="Accessibility Menu"
                className="w-11 h-11 rounded-full p-0 cursor-pointer transition-transform hover:scale-110 duration-100"
                style={{
                    bottom: '27px',
                    left: '98px',
                    color: '#434f58',
                    backgroundColor: '#465b5d',
                    cursor: 'pointer',
                    width: `44px`,
                    height: `44px`,
                    zIndex: 1049,
                    position: "fixed",
                    display: "block",
                }}
            >
                <span className="block">
                    <Image
                        className="w-[44px] h-[44px]"
                        width={44}
                        height={44}
                        src="https://cdn.userway.org/widgetapp/images/body_wh.svg"
                        alt=""
                        role="presentation"
                    />
                </span>
            </div>
        </>
    );
}
