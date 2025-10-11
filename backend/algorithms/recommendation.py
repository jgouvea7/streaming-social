from datetime import datetime, timezone
import sys
import json

def pontuation(video):
    date_video = datetime.fromisoformat(video["createAt"].replace("Z", "+00:00"))
    days_gone = (datetime.now(timezone.utc) - date_video).days

    like_count = video.get("likeCount", 0)
    comments = video.get("comments", [])
    comment_count = len(comments)
    
    score = (
        (like_count * 2.0) +
        (comment_count * 1.2) - 
        (days_gone * 0.8)
    )

    return max(score, 0)


def recommend_video(videos):
    sorted_videos = sorted(videos, key=pontuation, reverse=True)
    return sorted_videos

if __name__ == "__main__":
    input_data = sys.stdin.read()
    videos = json.loads(input_data)
    recomendation = recommend_video(videos)
    print(json.dumps(recomendation, ensure_ascii=False, indent=2))