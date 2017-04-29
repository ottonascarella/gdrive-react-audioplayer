const codecs = [

   ['audio/mpeg;', 'mp3'],
   ['audio/webm; codecs="vorbis"', 'webm'],
   ['audio/mp4; codecs="mp4a.40.2"', 'mp4'],
   ['audio/ogg; codecs="vorbis"', 'ogg'],
   ['audio/ogg; codecs="vorbis"', 'oga'],
   ['audio/wav; codecs="1"', 'wav'],
   ['audio/ogg; codecs="speex"', 'spx'],
   ['audio/ogg; codecs="flac"', 'oga'],
   ['audio/3gpp; codecs="samr"', '3gp']

];

const audio = new Audio();

const playable = codecs
                        .map(([codec,ext]) => {
                            const can = audio.canPlayType(codec);
                            return (can === 'probably')
                                        ? ext
                                        : false;
                        })
                        .filter(ext => !!ext);


const last = (x) => x[x.length - 1];

export default function(file) {
    const ext = last(file.name.split('.')).toLowerCase();
    return (playable.indexOf(ext) > -1);
}
