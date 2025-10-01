import React from "react";

export class TooltipFlavor extends React.Component<{ unique: "City" | "District" }> {
    render() {
        return <>
            {this.props.unique && (
                <div
                    style={{
                        marginTop: "0.2rem",
                        paddingLeft: "0.6rem",
                        fontStyle: "italic",
                        color: "#ccc",
                        fontSize: "0.85rem"
                    }}
                >
                    Once per {this.props.unique}
                </div>
            )}
        </>;
    }
}