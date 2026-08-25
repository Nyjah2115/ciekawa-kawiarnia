import Foundation
import AVFoundation
import AppKit
let src=URL(fileURLWithPath:CommandLine.arguments[1])
let out=CommandLine.arguments[2]
let t=Double(CommandLine.arguments[3])!
let w=Double(CommandLine.arguments[4])!
let a=AVURLAsset(url:src)
let g=AVAssetImageGenerator(asset:a)
g.appliesPreferredTrackTransform=true
g.maximumSize=CGSize(width:w,height:w*2)
g.requestedTimeToleranceBefore = .zero
g.requestedTimeToleranceAfter = .zero
let cg=try! g.copyCGImage(at:CMTime(seconds:t,preferredTimescale:600),actualTime:nil)
let rep=NSBitmapImageRep(cgImage:cg)
try! rep.representation(using:.jpeg,properties:[.compressionFactor:0.78])!
   .write(to:URL(fileURLWithPath:out))
print("\(out) @\(t)s")
