(function(){
  let ab_map=[], str_map={__proto__:null}, mers_set=[]
  const MAX_CHARS=Math.floor((2**32-1)/255)
  //minified adaptation of mersennetwister from https://gist.github.com/banksean/300494 begin
  class MersenneTwister{constructor(t){null==t&&(t=(new Date).getTime()),this.N=624,this.M=397,this.MATRIX_A=2567483615,this.UPPER_MASK=2147483648,this.LOWER_MASK=2147483647,this.mt=new Array(this.N),this.mti=this.N+1,this.init_genrand(t)}init_genrand(t){for(this.mt[0]=t>>>0,this.mti=1;this.mti<this.N;this.mti++){t=this.mt[this.mti-1]^this.mt[this.mti-1]>>>30;this.mt[this.mti]=(1812433253*((4294901760&t)>>>16)<<16)+1812433253*(65535&t)+this.mti,this.mt[this.mti]>>>=0}}genrand_int32(){var t,i=new Array(0,this.MATRIX_A);if(this.mti>=this.N){var s;for(this.mti==this.N+1&&this.init_genrand(5489),s=0;s<this.N-this.M;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+this.M]^t>>>1^i[1&t];for(;s<this.N-1;s++)t=this.mt[s]&this.UPPER_MASK|this.mt[s+1]&this.LOWER_MASK,this.mt[s]=this.mt[s+(this.M-this.N)]^t>>>1^i[1&t];t=this.mt[this.N-1]&this.UPPER_MASK|this.mt[0]&this.LOWER_MASK,this.mt[this.N-1]=this.mt[this.M-1]^t>>>1^i[1&t],this.mti=0}return t=this.mt[this.mti++],t^=t>>>11,t^=t<<7&2636928640,t^=t<<15&4022730752,(t^=t>>>18)>>>0}}
  //minified adaptation of mersennetwister from https://gist.github.com/banksean/300494 end
  for(let i=0;i<256;i++){
    ab_map[i]=String.fromCharCode(i);
    str_map[ab_map[i]]=i;
    mers_set[i]=Array(4096);
    let mers=new MersenneTwister(i);
    for(let j=0;j<4096;j++)
      mers_set[i][j] = mers.genrand_int32();
  }
  function str2u8(str){
    const u=new Uint8Array(str.length);
    for(let i=0;i<str.length;i++) u[i]=str_map[str[i]];
    return u;
  }
  function u82str(u){
    let chars="";
    for(let i=0;i<u.length;i++) chars+=ab_map[u[i]];
    return chars;
  }
  
  function aine(val,num){
    //add if not empty
    return val>0? val+num: val;
  }
  function byte_digest(bytes){
    let n=0, i=0;
    for(i;i<bytes.length;i++) n+=bytes[i];
    while(n>255){
      n=
        +aine((n>>>0)&255,1) + aine((n>>>8)&255,2)
        +aine((n>>>16)&255,3) + aine((n>>>24)&255,4);
    }
    return ab_map[n];
  }
  function shiftLeft(bytes){
    for(let i=0;i<bytes.length;i++){
      let bit=Number(bytes[i]>127); //bit that gets lost
      bytes[i]<<=1;
      bytes[i]+=bit;
    }
    return byte_digest(bytes);
  }
  function shiftLeftAll(bytes){
    let bit=0;
    for(let i=bytes.length-1;i>=0;i--){
      bytes[i]+=bit;
      bytes[i]<<=1;
      bit=Number(bytes[i]>127); //bit that gets lost
    }
    bytes[bytes.length-1]+=bit;
    return byte_digest(bytes);
  }
  function shiftRight(bytes){
    for(let i=0;i<bytes.length;i++){
      let bit=bytes[i]&1; //bit that gets lost
      bytes[i]>>>=1;
      bytes[i]+=bit<<7;
    }
    return byte_digest(bytes);
  }
  function shiftRightAll(bytes){
    let bit=0;
    for(let i=0;i<bytes.length;i++){
      bytes[i]+=bit<<7;
      bytes[i]>>>=1;
      bit=bytes[i]&1; //bit that gets lost
    }
    bytes[0]+=bit<<7;
    return byte_digest(bytes);
  }
  function prepare(text){
    const arr1=str2u8(text), arr2=str2u8(text)
    const mers=mers_set[ str_map[byte_digest(arr1)] ];
    for(let i=0;i<arr1.length;i++)  arr2[i] = mers[i%mers.length]^arr1[i];
    return arr2;
  }
  function homemade_hash(text){
    text ||= '\x00\x00'
    while(text.length<2) text+='\x00';
    if(text.length>MAX_CHARS)
      throw new RangeError("text length is too long"); 
    let arr=prepare(text), str="";
    for(let i=0;i<8;i++){
      str += shiftLeft(arr);
      str += shiftLeftAll(arr);
      str += shiftRight(arr);
      str += shiftRightAll(arr);
      //arr = prepare(u82str(arr));
    }
    return str
  }
  //exporting begin
  typeof window==="undefined"? module.exports=homemade_hash: window.homemade_hash=homemade_hash;
  //exporting end
})()
