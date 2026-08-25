import Foundation
import AVFoundation
import AppKit

let src = URL(fileURLWithPath: CommandLine.arguments[1])
let outDir = CommandLine.arguments[2]
let count = Int(CommandLine.arguments[3])!
let width = Double(CommandLine.arguments[4])!
let quality = Double(CommandLine.arguments[5])!

let asset = AVURLAsset(url: src)
let dur = CMTimeGetSeconds(asset.duration)
let gen = AVAssetImageGenerator(asset: asset)
gen.appliesPreferredTrackTransform = true
gen.maximumSize = CGSize(width: width, height: width)
gen.requestedTimeToleranceBefore = CMTime(seconds: 0.01, preferredTimescale: 600)
gen.requestedTimeToleranceAfter  = CMTime(seconds: 0.01, preferredTimescale: 600)

var total = 0
for i in 0..<count {
    let t = dur * (Double(i) / Double(count - 1)) * 0.995
    do {
        let cg = try gen.copyCGImage(at: CMTime(seconds: t, preferredTimescale: 600), actualTime: nil)
        let rep = NSBitmapImageRep(cgImage: cg)
        guard let data = rep.representation(using: .jpeg, properties: [.compressionFactor: quality]) else { continue }
        let out = URL(fileURLWithPath: "\(outDir)/\(String(format: "%03d", i)).jpg")
        try data.write(to: out)
        total += data.count
    } catch { FileHandle.standardError.write("err \(i): \(error)\n".data(using:.utf8)!) }
}
print("frames=\(count) size=\(width) totalKB=\(total/1024) avgKB=\(total/1024/count)")
