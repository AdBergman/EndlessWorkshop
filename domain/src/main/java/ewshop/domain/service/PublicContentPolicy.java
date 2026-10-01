package ewshop.domain.service;

import java.util.regex.Pattern;

public final class PublicContentPolicy {

    private static final Pattern NON_PUBLIC_KEY = Pattern.compile(
            "(?:^|_)(?:Prototype|Placeholder|BaseTemplate|Deprecated)(?:_|$)", Pattern.CASE_INSENSITIVE);
    private static final Pattern NON_PUBLIC_NAME = Pattern.compile(
            "\\[(?:DEPRECATED|PROTOTYPE|PLACEHOLDER|INTERNAL|TBD)]", Pattern.CASE_INSENSITIVE);

    private PublicContentPolicy() {}

    public static boolean isPublicKey(String key) {
        return key != null && !key.isBlank() && !key.trim().startsWith("%")
                && !NON_PUBLIC_KEY.matcher(key).find();
    }

    public static boolean isPublicDisplayName(String name) {
        return name == null || (!name.trim().startsWith("%")
                && !NON_PUBLIC_NAME.matcher(name.trim()).find());
    }
}
