import React from "react";
import { CircularBehavior, DefaultNode, FlumeCommentMap, NodeHeaderRenderCallback, NodeMap, NodeTypeMap, PortTypeMap } from "./types";
interface NodeEditorProps {
    comments?: FlumeCommentMap;
    nodes?: NodeMap;
    nodeTypes: NodeTypeMap;
    portTypes: PortTypeMap;
    defaultNodes?: DefaultNode[];
    context?: any;
    onChange?: (nodes: NodeMap) => void;
    onCommentsChange?: (comments: FlumeCommentMap) => void;
    initialScale?: number;
    onScaleChange?: (scale: number) => void;
    spaceToPan?: boolean;
    hideComments?: boolean;
    disableComments?: boolean;
    disableZoom?: boolean;
    disablePan?: boolean;
    circularBehavior?: CircularBehavior;
    renderNodeHeader?: NodeHeaderRenderCallback;
    debug?: boolean;
    style?: React.CSSProperties;
}
export declare let NodeEditor: React.ForwardRefExoticComponent<NodeEditorProps & React.RefAttributes<unknown>>;
export {};