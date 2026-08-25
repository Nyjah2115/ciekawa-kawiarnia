import AppKit

/* Wycina prostokąt z logo i zamienia jednolite kremowe tło na przezroczystość.
   Kreska zostaje w jednym ciemnym kolorze, więc logo da się przefarbować
   filtrem CSS na dowolne tło. Pracujemy na surowym buforze — colorAt/setColor
   na każdym pikselu jest wolne i hałasuje ostrzeżeniami o przestrzeni barw. */
let inPath = CommandLine.arguments[1], outPath = CommandLine.arguments[2]
let cx = Int(CommandLine.arguments[3])!, cy = Int(CommandLine.arguments[4])!
let cw = Int(CommandLine.arguments[5])!, ch = Int(CommandLine.arguments[6])!
let maxW = Int(CommandLine.arguments[7])!

guard let img = NSImage(contentsOfFile: inPath),
      let tiff = img.tiffRepresentation,
      let srcRep = NSBitmapImageRep(data: tiff),
      let cg = srcRep.cgImage else { exit(1) }

let sw = cg.width, sh = cg.height
var srcBuf = [UInt8](repeating: 0, count: sw * sh * 4)
let cs = CGColorSpaceCreateDeviceRGB()
srcBuf.withUnsafeMutableBytes { p in
    let ctx = CGContext(data: p.baseAddress, width: sw, height: sh, bitsPerComponent: 8,
                        bytesPerRow: sw*4, space: cs,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: sw, height: sh))
}

var dst = [UInt8](repeating: 0, count: cw * ch * 4)
for y in 0..<ch {
    let sy = cy + y
    if sy < 0 || sy >= sh { continue }
    for x in 0..<cw {
        let sx = cx + x
        if sx < 0 || sx >= sw { continue }
        let si = (sy*sw + sx)*4, di = (y*cw + x)*4
        let r = Double(srcBuf[si]), g = Double(srcBuf[si+1]), b = Double(srcBuf[si+2])
        let l = (0.299*r + 0.587*g + 0.114*b) / 255.0
        /* Alfa rośnie tam, gdzie piksel ciemnieje — krawędzie zostają gładkie. */
        let a = max(0, min(1, (0.94 - l) / 0.62))
        dst[di]   = UInt8(41  * a)   // premultiplied
        dst[di+1] = UInt8(26  * a)
        dst[di+2] = UInt8(18  * a)
        dst[di+3] = UInt8(255 * a)
    }
}

var outW = cw, outH = ch
var finalBuf = dst
if cw > maxW {
    outW = maxW; outH = Int(Double(ch) * Double(maxW) / Double(cw))
    let small = CGContext(data: nil, width: outW, height: outH, bitsPerComponent: 8,
                          bytesPerRow: outW*4, space: cs,
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    small.interpolationQuality = .high
    let bigCtx = dst.withUnsafeMutableBytes { p -> CGImage in
        let c = CGContext(data: p.baseAddress, width: cw, height: ch, bitsPerComponent: 8,
                          bytesPerRow: cw*4, space: cs,
                          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
        return c.makeImage()!
    }
    small.draw(bigCtx, in: CGRect(x: 0, y: 0, width: outW, height: outH))
    let outImg = small.makeImage()!
    let rep = NSBitmapImageRep(cgImage: outImg)
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: outPath))
    print("zapisano \(outPath) \(outW)x\(outH)")
    exit(0)
}
let c = finalBuf.withUnsafeMutableBytes { p -> CGImage in
    let ctx = CGContext(data: p.baseAddress, width: outW, height: outH, bitsPerComponent: 8,
                        bytesPerRow: outW*4, space: cs,
                        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    return ctx.makeImage()!
}
try! NSBitmapImageRep(cgImage: c).representation(using: .png, properties: [:])!
    .write(to: URL(fileURLWithPath: outPath))
print("zapisano \(outPath) \(outW)x\(outH)")
