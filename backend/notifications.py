# Fichier pour gérer les notifications
notifications_list = []
notification_id = 0

def create_notification(user_id, message, type_notif):
    global notification_id
    notification_id += 1
    notif = {
        'id': notification_id,
        'user_id': user_id,
        'message': message,
        'type': type_notif,
        'read': False,
        'created_at': '2024-04-03T12:00:00'
    }
    notifications_list.append(notif)
    return notif

def get_user_notifications(user_id):
    return [n for n in notifications_list if n['user_id'] == user_id]

def mark_as_read(notif_id):
    for n in notifications_list:
        if n['id'] == notif_id:
            n['read'] = True
            return True
    return False