package ewshop.facade.dto.importing;

public final class ImportVisibilityPolicy {

    private ImportVisibilityPolicy() {
    }

    public static boolean shouldFilter(
            Boolean hidden,
            Boolean isHidden,
            Boolean isPlayerFacing,
            Boolean isPrototype,
            Boolean isBaseTemplate,
            Boolean isPlaceholder,
            Boolean isInternal
    ) {
        return Boolean.TRUE.equals(hidden)
                || Boolean.TRUE.equals(isHidden)
                || Boolean.FALSE.equals(isPlayerFacing)
                || Boolean.TRUE.equals(isPrototype)
                || Boolean.TRUE.equals(isBaseTemplate)
                || Boolean.TRUE.equals(isPlaceholder)
                || Boolean.TRUE.equals(isInternal);
    }
}
