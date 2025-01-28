import { StateEffect, StateField, Transaction } from "@codemirror/state";
import { EditorView, Decoration, DecorationSet } from "@codemirror/view";

interface HideTextEffectData {
  from: number;
  to: number;
}

export let hideTextEffect = StateEffect.define<HideTextEffectData>();

export let hiddenRangesField = StateField.define<DecorationSet>({
  create(): DecorationSet {
    return Decoration.none;
  },
  update(hiddenRanges: DecorationSet, transaction: Transaction): DecorationSet {
    let updatedRanges = hiddenRanges;
    for (const effect of transaction.effects) {
      if (effect.is(hideTextEffect)) {
        const { from, to } = effect.value;
        updatedRanges = updatedRanges.update({
          add: [Decoration.replace({}).range(from, to)],
        });
      }
    }
    return updatedRanges.map(transaction.changes);
  },
  provide: (field) => EditorView.decorations.from(field),
});

export function fixedHeightEditorExtension() {
  return EditorView.theme({
    "&": {
      height: "calc(100% - 30px)",
    },
    ".cm-scroller": {
      overflow: "auto",
      "scrollbar-width": "thin",
    },
  });
}

export function customScrollbar(darkMode: boolean) {
  if (darkMode) {
    return EditorView.theme({
      ".cm-scroller": {
        "scrollbar-color": "var(--gray5) var(--gray7)",
      },
    });
  } else {
    return EditorView.theme({
      ".cm-scroller": {
        "scrollbar-color": "var(--gray3) var(--gray1)",
      },
    });
  }
}
