package ewshop.app.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.net.URI;

@Controller
public class LegacySeoRedirectController {

    @GetMapping(value = {
            "/{kind:abilities|heroes|tech|units}/{entryKey:[a-z0-9-]+}",
            "/{kind:abilities|heroes|tech|units}/{entryKey:[a-z0-9-]+}/"
    })
    public ResponseEntity<Void> redirectLegacyGeneratedEntity(
            @PathVariable String kind,
            @PathVariable String entryKey
    ) {
        return permanentRedirect("/encyclopedia/" + kind + "/" + entryKey);
    }

    @GetMapping("/encyclopedia/")
    public ResponseEntity<Void> redirectEncyclopediaTrailingSlash() {
        return permanentRedirect("/encyclopedia");
    }

    @GetMapping("/encyclopedia/{kind:[a-z][a-z0-9-]*}/")
    public ResponseEntity<Void> redirectEncyclopediaCategoryTrailingSlash(@PathVariable String kind) {
        return permanentRedirect("/encyclopedia/" + kind);
    }

    @GetMapping("/encyclopedia/{kind:[a-z][a-z0-9-]*}/{entryKey:[a-z0-9-]+}/")
    public ResponseEntity<Void> redirectEncyclopediaEntityTrailingSlash(
            @PathVariable String kind,
            @PathVariable String entryKey
    ) {
        return permanentRedirect("/encyclopedia/" + kind + "/" + entryKey);
    }

    private static ResponseEntity<Void> permanentRedirect(String target) {
        return ResponseEntity.status(HttpStatus.MOVED_PERMANENTLY)
                .location(URI.create(target))
                .build();
    }
}
