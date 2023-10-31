public interface LinkedinServiceInterface {
    Map<String, Object> postContent(String userId, string text, string accessToken);
    Map<String, Object> getImageUploadUrl (String uploadImg, String userId, String accessToken, String textMessage);
    Map<String, Object> uploadImage (String userId, String uploadImg, String accessToken, String uploadURL, String asset, String textMessage);
    Map<String, Object> postImage (String userId, String accessToken, String asset, String textMessage);
    Map<String, Object> initializeVideoUpload (String userId, String accessToken);
    Map<String, Object> uploadVideo (String uploadURL, Blob uploadVideo, String accessToken);
}