package ewshop.facade.dto.importing;

public record ImportDetailsDto(
        int receivedDistinctKeys,
        int duplicatesInFile
) { }