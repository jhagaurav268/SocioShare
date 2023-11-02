//
// Generated by JSON2Apex http://json2apex.herokuapp.com/
//

public class VideoUploadUrl {

	public Value value;

	public class UploadInstructions {
		public String uploadUrl;
		public Integer lastByte;
		public Integer firstByte;
	}

	public class Value {
		public Long uploadUrlsExpireAt;
		public String video;
		public List<UploadInstructions> uploadInstructions;
		public String uploadToken;
	}

	
	public static VideoUploadUrl parse(String json) {
		return (VideoUploadUrl) System.JSON.deserialize(json, VideoUploadUrl.class);
	}
}