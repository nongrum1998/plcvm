/** Props for the {@link Ternary} component. */
export interface TernaryProps {
  /** Branch selector. A truthy value renders {@link TernaryProps.ifTrue}. */
  condition: boolean;
  /** Node rendered when {@link TernaryProps.condition} is `true`. */
  ifTrue: React.ReactNode;
  /** Node rendered when {@link TernaryProps.condition} is `false`. */
  ifFalse: React.ReactNode;
}

/**
 * Renders one of two branches in place, inline in the parent's element tree.
 *
 * Equivalent to `condition ? ifTrue : ifFalse`, but expressed as a component so
 * that both branches are built unconditionally and passed as props. This lets
 * JSX stay declarative and keeps long branch bodies out of surrounding
 * expressions, which matters in React Native layouts where an inline ternary
 * quickly becomes unreadable.
 *
 * Because both `ifTrue` and `ifFalse` are evaluated by the caller before this
 * component runs, any hooks or side effects must live inside the branch
 * elements, not in the expressions passed here. No host element is rendered,
 * so this component adds no view to the native tree.
 *
 * @param props.condition - Branch selector.
 * @param props.ifTrue - Node to render when `condition` is `true`.
 * @param props.ifFalse - Node to render when `condition` is `false`.
 * @returns The selected node, exactly as passed in.
 * @example
 * ```tsx
 * <Ternary
 *   condition={isSuccess}
 *   ifTrue={<SuccessCard message={message} />}
 *   ifFalse={<ErrorCard message={message} onRetake={onRetakePress} />}
 * />
 * ```
 */
export const Ternary = ({ condition, ifTrue, ifFalse }: TernaryProps) => {
  return condition ? ifTrue : ifFalse;
};
