import { act, render, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { expect, vi } from "vitest";
import { apiClient } from "@/api/apiClient";
import QuestExplorerPage from "@/pages/QuestExplorerPage";

export const mockedApiClient = vi.mocked(apiClient);

export function renderPage(initialEntry = "/quests") {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/quests/*" element={<><LocationProbe /><QuestExplorerPage /></>} />
            </Routes>
        </MemoryRouter>
    );
}

export function renderPageWithHistory(initialEntries: string[], initialIndex = initialEntries.length - 1) {
    return render(
        <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
            <Routes>
                <Route path="/quests/*" element={<><HistoryBackButton /><LocationProbe /><QuestExplorerPage /></>} />
            </Routes>
        </MemoryRouter>
    );
}

export function LocationProbe() {
    const location = useLocation();
    return <output data-testid="route-location">{`${location.pathname}${location.search}`}</output>;
}

export function HistoryBackButton() {
    const navigate = useNavigate();
    return <button type="button" onClick={() => navigate(-1)}>Back</button>;
}

export type MockIntersectionObserverRecord = {
    callback: IntersectionObserverCallback;
    elements: Element[];
    observer: IntersectionObserver;
};

export function stubIntersectionObservers(): MockIntersectionObserverRecord[] {
    const observers: MockIntersectionObserverRecord[] = [];
    class MockIntersectionObserver implements IntersectionObserver {
        readonly root: Element | Document | null = null;
        readonly rootMargin = "";
        readonly thresholds: ReadonlyArray<number> = [];
        elements: Element[] = [];

        constructor(callback: IntersectionObserverCallback) {
            observers.push({ callback, elements: this.elements, observer: this });
        }

        observe = (target: Element) => {
            this.elements.push(target);
        };

        unobserve = (target: Element) => {
            this.elements = this.elements.filter((element) => element !== target);
        };

        disconnect = () => {
            this.elements = [];
        };

        takeRecords = () => [];
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    return observers;
}

export function intersectLoreSegment(observers: MockIntersectionObserverRecord[], railEntryKey: string) {
    const segment = document.querySelector(`[data-rail-entry-key="${railEntryKey}"]`);
    expect(segment).not.toBeNull();
    const observerRecord = observers.at(-1);
    expect(observerRecord).toBeDefined();
    act(() => {
        observerRecord!.callback([{
            boundingClientRect: { top: 0 } as DOMRectReadOnly,
            intersectionRatio: 0.8,
            intersectionRect: {} as DOMRectReadOnly,
            isIntersecting: true,
            rootBounds: null,
            target: segment!,
            time: 0,
        }], observerRecord!.observer);
    });
}

export function MissingRouteHarness() {
    const navigate = useNavigate();

    return (
        <>
            <button type="button" onClick={() => navigate("/quests/MissingAlias")}>
                Missing route
            </button>
            <QuestExplorerPage />
        </>
    );
}

export function QuestRouteHarness() {
    const navigate = useNavigate();

    return (
        <>
            <button type="button" onClick={() => navigate("/quests/Quest_B")}>
                Open second tide
            </button>
            <QuestExplorerPage />
        </>
    );
}

export function expectElementBefore(first: Element, second: Element) {
    expect(Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
}

export function getStepHeaderLabel(container: HTMLElement, label: string) {
    const stepLabel = within(container)
        .getAllByText(label)
        .find((element) => element.closest(".questExplorer-stepLabel"));
    if (!stepLabel) throw new Error(`Expected progression header label ${label}`);
    return stepLabel;
}
