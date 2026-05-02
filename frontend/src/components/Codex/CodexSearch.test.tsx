import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CodexSearch from "./CodexSearch";
import type { CodexEntry } from "@/types/dataTypes";

const suggestions: CodexEntry[] = [
    {
        exportKind: "abilities",
        entryKey: "Ability_Blossom",
        displayName: "[DustColored] Blossom Burst",
        descriptionLines: ["Launches a blossom wave."],
        referenceKeys: [],
    },
    {
        exportKind: "units",
        entryKey: "UnitAbility_Bloom_Knight",
        displayName: "",
        descriptionLines: [],
        referenceKeys: [],
    },
];

describe("CodexSearch", () => {
    it("selects the highlighted autocomplete option with keyboard navigation", async () => {
        const user = userEvent.setup();
        const onSelectSuggestion = vi.fn();
        const onConfirmQuery = vi.fn();

        render(
            <CodexSearch
                value="bloom"
                onChange={() => {}}
                resultCount={2}
                totalCount={12}
                suggestions={suggestions}
                onSelectSuggestion={onSelectSuggestion}
                onConfirmQuery={onConfirmQuery}
            />
        );

        const input = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.click(input);
        await user.keyboard("{ArrowDown}{Enter}");

        expect(onSelectSuggestion).toHaveBeenCalledWith(suggestions[1]);
        expect(onConfirmQuery).not.toHaveBeenCalled();
    });

    it("confirms the current query when no suggestions are available", async () => {
        const user = userEvent.setup();
        const onConfirmQuery = vi.fn();

        render(
            <CodexSearch
                value="auriga"
                onChange={() => {}}
                resultCount={0}
                totalCount={12}
                suggestions={[]}
                onSelectSuggestion={() => {}}
                onConfirmQuery={onConfirmQuery}
            />
        );

        const input = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.click(input);
        await user.keyboard("{Enter}");

        expect(onConfirmQuery).toHaveBeenCalledTimes(1);
    });

    it("renders fallback labels without exposing internal keys", async () => {
        const user = userEvent.setup();

        render(
            <CodexSearch
                value="bloom"
                onChange={() => {}}
                resultCount={2}
                totalCount={12}
                suggestions={suggestions}
                onSelectSuggestion={() => {}}
                onConfirmQuery={() => {}}
            />
        );

        const input = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.click(input);

        expect(screen.getByText("Bloom Knight")).toBeInTheDocument();
        expect(screen.queryByText("UnitAbility_Bloom_Knight")).not.toBeInTheDocument();
    });

    it("renders tokenized display names without leaking bracket text", async () => {
        const user = userEvent.setup();

        render(
            <CodexSearch
                value="blossom"
                onChange={() => {}}
                resultCount={2}
                totalCount={12}
                suggestions={suggestions}
                onSelectSuggestion={() => {}}
                onConfirmQuery={() => {}}
            />
        );

        const input = screen.getByRole("combobox", { name: /search the encyclopedia/i });
        await user.click(input);

        expect(screen.getByText("Blossom Burst")).toBeInTheDocument();
        expect(screen.queryByText("[DustColored]")).not.toBeInTheDocument();
    });
});
