package ewshop.app.seo;

import ewshop.app.seo.storage.SeoOutputLocator;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SitemapController {

    private final SeoOutputLocator seoOutputLocator;

    public SitemapController(SeoOutputLocator seoOutputLocator) {
        this.seoOutputLocator = seoOutputLocator;
    }

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<Resource> sitemap() {
        Resource generated = new FileSystemResource(seoOutputLocator.getGeneratedSitemapPath());

        if (generated.exists()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_XML)
                    .body(generated);
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_XML)
                .body(new ClassPathResource("static/sitemap.xml"));
    }
}
