// Levenshtein Distance function made by Cyber28#2864

exports.levenshteinRatio = (target, source) => {
    if (source == null || target == null) return 0.0
    if (source.length == 0 || target.length == 0) return 0.0
    if (source === target) return 1.0

    let sourceWordCount = source.length
    let targetWordCount = target.length

    let distance = new Array(sourceWordCount + 1)
    for (let i = 0; i < distance.length; i++) {
        distance[i] = new Array(targetWordCount + 1)
    }

    for (let i = 0; i <= sourceWordCount; distance[i][0] = i++);
    for (let j = 0; j <= targetWordCount; distance[0][j] = j++);

    for (let i = 1; i <= sourceWordCount; i++) {
        for (let j = 1; j <= targetWordCount; j++) {
            let cost = ((target.charAt(j - 1) === source.charAt(i - 1)) ? 0 : 1)

            distance[i][j] = Math.min(Math.min(distance[i - 1][j] + 1, distance[i][j - 1] + 1), distance[i - 1][j - 1] + cost)
        }
    }

    return 1.0 - distance[sourceWordCount][targetWordCount] / Math.max(source.length, target.length)
}