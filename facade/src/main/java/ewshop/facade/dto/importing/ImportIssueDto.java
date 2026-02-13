package ewshop.facade.dto.importing;


public record ImportIssueDto(
        String code,
        String entityKind,
        String entityKey,
        String displayName,
        String details
) { }