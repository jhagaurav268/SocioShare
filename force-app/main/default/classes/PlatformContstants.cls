public class PlatformContstants {
	public static final String FACEBOOK_STORAGE_SETTING_NAME = 'Facebook_Storage';
    public static final String LINKEDIN_STORAGE_SETTING_NAME = 'LinkedIn_Storage';
    public static final String INSTAGRAM_STORAGE_SETTING_NAME = 'Instagram_Storage';
   
    public static final String ORG_ID = UserInfo.getOrganizationId();
    public static final Map<String,String> CONTENT_TYPE = new Map<String,String>{
        'data:image/png;base64' => 'image/png',
        'data:image/jpeg;base64' => 'image/jpeg',
        'data:image/jpeg;base64' => 'image/jpg',
        'data:application/pdf;base64' => 'application/pdf',
        'data:application/vnd.ms-powerpoint;base64' => 'application/vnd.ms-powerpoint',
        'data:text/plain;base64' => 'text/plain', //.txt
        'data:application/vnd.ms-excel;base64' => 'application/vnd.ms-excel',
        'data:application/zip;base64' => 'application/zip',
        'data:application/xml;base64' => 'application/xml', //.xml
        'data:application/msword;base64' => 'application/msword', //.doc
        'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  //.docx
        'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', //.xlsx
        'data:application/vnd.ms-powerpoint;base64' => 'application/vnd.ms-powerpoint', //.ppt
        'data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',  //.pptx
        'data:audio/mpeg;base64' => 'audio/mpeg', //.mp3
        'data:video/mpeg;base64' => 'video/mpeg', //.mpeg
        'data:video/mp4;base64' => 'video/mp4',  //.mp4
        'data:video/x-msvideo;base64' => 'video/x-msvideo', //.avi
        'data:video/3gpp;base64' => 'video/3gpp', // 3gp video
        'data:application/vnd.rar;base64' => 'application/vnd.rar', //.rar
        'data:text/css;base64' => 'text/css',  // .css
        'data:text/html;base64' => 'text/html', //.html
        'data:video/mp4;base64' => 'video/mp4', //mpeg4
        'data:video/quicktime;base64' => 'video/quicktime',  // video/quicktime error .mov
        'data:text/csv;base64' => 'text/csv' ,//.csv
        'data:video/avi;base64' => 'video/avi',  //.video/avi  
        'data:application/json;base64' => 'application/json' ,  //.json
        'data:application/octet-stream;base64'=> 'application/octet-stream', //.doc docx
        'data:image/gif;base64'=> 'image/gif', //.gif
        'data:image/bmp;base64'=> 'image/bmp', //.bmp
        'data:image/tiff;base64'=> 'image/tiff', //.tiff
        'data:application/x-msdownload;base64'=> 'application/x-msdownload' ,//.exe 
        'data:application/postscript;base64'=> 'application/postscript' ,// PostScript (.ai, .eps, or .ps) file.
        'data:application/x-zip-compressed;base64' => 'application/x-zip-compressed', //.zip win10
        'data:text/xml;base64' => 'text/xml' //. xml     
    };
}