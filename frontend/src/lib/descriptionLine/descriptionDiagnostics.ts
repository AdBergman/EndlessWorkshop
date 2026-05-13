import {
    type DescriptionLineAst,
    type DescriptionTextNode,
    type DescriptionTokenNode,
    type TokenStyle,
    parseDescriptionLine,
} from "./descriptionLineRenderer";

export type EntityLikeTokenKind =
    | "tech"
    | "unit"
    | "district"
    | "improvement"
    | "codex"
    | "ability"
    | "hero"
    | "population";

export type DescriptionDiagnosticKind =
    | "known-style-token"
    | "unknown-token"
    | "entity-like-token"
    | "malformed-token";

export type DescriptionDiagnosticReason =
    | "empty-token"
    | "unclosed-token"
    | "unexpected-closing-bracket";

export type DescriptionTokenDiagnostic = {
    kind: DescriptionDiagnosticKind;
    token: string;
    raw: string;
    index: number;
    style?: TokenStyle;
    entityKindHint?: EntityLikeTokenKind;
    reason?: DescriptionDiagnosticReason;
};

const ENTITY_PREFIX_HINTS: Array<[RegExp, EntityLikeTokenKind]> = [
    [/^tech[_:]/i, "tech"],
    [/^unit[_:]/i, "unit"],
    [/^district[_:]/i, "district"],
    [/^improvement[_:]/i, "improvement"],
    [/^(ability|unitability)[_:]/i, "ability"],
    [/^hero[_:]/i, "hero"],
    [/^(population|populationcategory)[_:]/i, "population"],
    [/^(luxuryresource|strategicresource|resource)[_:]?\d*/i, "codex"],
];

function inferEntityKindHint(token: string): EntityLikeTokenKind | undefined {
    return ENTITY_PREFIX_HINTS.find(([pattern]) => pattern.test(token))?.[1];
}

function diagnoseTokenNode(node: DescriptionTokenNode): DescriptionTokenDiagnostic {
    if (!node.token) {
        return {
            kind: "malformed-token",
            token: node.token,
            raw: node.raw,
            index: node.index,
            reason: "empty-token",
        };
    }

    if (node.style) {
        return {
            kind: "known-style-token",
            token: node.token,
            raw: node.raw,
            index: node.index,
            style: node.style,
        };
    }

    const entityKindHint = inferEntityKindHint(node.token);
    if (entityKindHint) {
        return {
            kind: "entity-like-token",
            token: node.token,
            raw: node.raw,
            index: node.index,
            entityKindHint,
        };
    }

    return {
        kind: "unknown-token",
        token: node.token,
        raw: node.raw,
        index: node.index,
    };
}

function diagnoseTextNode(node: DescriptionTextNode): DescriptionTokenDiagnostic[] {
    const diagnostics: DescriptionTokenDiagnostic[] = [];
    let searchIndex = 0;

    while (searchIndex < node.value.length) {
        const openIndex = node.value.indexOf("[", searchIndex);
        const closeIndex = node.value.indexOf("]", searchIndex);

        if (openIndex === -1 && closeIndex === -1) {
            break;
        }

        if (closeIndex !== -1 && (openIndex === -1 || closeIndex < openIndex)) {
            diagnostics.push({
                kind: "malformed-token",
                token: "",
                raw: "]",
                index: node.index + closeIndex,
                reason: "unexpected-closing-bracket",
            });
            searchIndex = closeIndex + 1;
            continue;
        }

        diagnostics.push({
            kind: "malformed-token",
            token: node.value.slice(openIndex + 1).trim(),
            raw: node.value.slice(openIndex),
            index: node.index + openIndex,
            reason: "unclosed-token",
        });
        break;
    }

    return diagnostics;
}

export function getDescriptionDiagnostics(ast: DescriptionLineAst): DescriptionTokenDiagnostic[] {
    return ast.nodes.flatMap((node) => {
        if (node.type === "token") {
            return [diagnoseTokenNode(node)];
        }

        return diagnoseTextNode(node);
    });
}

export function diagnoseDescriptionLine(line: string): DescriptionTokenDiagnostic[] {
    return getDescriptionDiagnostics(parseDescriptionLine(line));
}
