from datetime import timedelta, datetime

import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_detailed_data_model as model
from HateMate_Backend_App.models import ChatGroup, Comment, ChatUser, Classification
from django.db import models
from django.db.models import Q, Count
from django.db.models.functions import Trunc, Coalesce
from django.db.models import Value as V
from django.utils.timezone import utc


def get_comments_in_period_chatgroup_category(chat_group, start, end, classification):
    """"""
    return Comment.objects.filter(
        (Q(moderator_classification__isnull=False) & Q(moderator_classification=classification) | (
                Q(moderator_classification__isnull=True) & Q(classifier_classification=classification))),
        chat_group=chat_group, timestamp__range=(start, end))


def get_all_comments_in_day_and_chatgroup(date, chat_group):
    """get all comments in the given chatgroup and the given interval (aka day/date)

    Args:
        date(date): just one day
        chat_group (ChatGroup): a chatgroup

    Returns:
        list: of Comments on given day (aka interval)
    """

    return Comment.objects.filter(chat_group=chat_group,
                                  timestamp__year=date.year,
                                  timestamp__month=date.month,
                                  timestamp__day=date.day,
                                  )


def get_all_manually_flagged_comments_as_trunc(chat_group, start_time, end_time, interval_size):
    """
    Gets all manually flagged comments in the given time range, filtered by chat group and grouped by the given interval size
    @param chat_group: chatgroup that should be filtered for
    @param start_time: start of time interval
    @param end_time: end of time interval
    @param interval_size: form of interval of which the data should be grouped by, can be: second, minute, hour, day, week, month, quarter, year
    @returns QuerySet with results
    """
    return Comment.objects.filter(reviewed_by_moderator=True, moderator_classification__id__gt=0,
                                  timestamp__range=(start_time, end_time), chat_group=chat_group).annotate(
        interval=Trunc('timestamp', interval_size)).values('interval').annotate(flagged=Coalesce(Count('id'), V(0)))


def get_all_manually_unflagged_comments_as_trunc(chat_group, start_time, end_time, interval_size):
    """
    Gets all manually unflagged comments in the given time range, filtered by chat group and grouped by the given interval size
    @param chat_group: chatgroup that should be filtered for
    @param start_time: start of time interval
    @param end_time: end of time interval
    @param interval_size: form of interval of which the data should be grouped by, can be: second, minute, hour, day, week, month, quarter, year
    @returns QuerySet with results
    """
    return Comment.objects.filter(reviewed_by_moderator=True, moderator_classification__id=0,
                                  timestamp__range=(start_time, end_time), chat_group=chat_group).annotate(
        interval=Trunc('timestamp', interval_size)).values('interval').annotate(unflagged=Count('id'))


def get_users_within_chat_group_and_timeframe(chat_group: ChatGroup, start_time, end_time, interval: int = 1440,
                                              hatespeach_only: bool = False):
    start_time = datetime.combine(start_time.date(), start_time.time()).replace(tzinfo=utc)
    end_time = datetime.combine(end_time.date(), end_time.time()).replace(tzinfo=utc)

    accepted_classifications = []
    if hatespeach_only:
        sum = Comment.objects \
            .filter((Q(moderator_classification__isnull=False) & Q(moderator_classification__id__range=(1, 7)) | (
                Q(moderator_classification__isnull=True) & Q(classifier_classification__id__range=(1, 7)))),
                    chat_group=chat_group, timestamp__range=(start_time, end_time)) \
            .distinct("chat_user").count()
    else:
        sum = Comment.objects \
            .filter(chat_group=chat_group, timestamp__range=(start_time, end_time)) \
            .distinct("chat_user").count()

    intervals = 1
    max = model.StatisticsAggregationDateValue(0, "")
    min = model.StatisticsAggregationDateValue(2 ** 63 - 1, "")
    while True:
        fr0m = start_time + timedelta(minutes=interval) * (intervals - 1)
        t0 = start_time + timedelta(minutes=interval) * intervals
        if end_time <= t0:
            t0 = end_time

        intervals += 1
        if hatespeach_only:
            users_in_interval = Comment.objects \
                .filter((Q(moderator_classification__isnull=False) & Q(moderator_classification__id__range=(1, 7)) | (
                    Q(moderator_classification__isnull=True) & Q(classifier_classification__id__range=(1, 7)))),
                        chat_group=chat_group, timestamp__range=(fr0m, t0)) \
                .distinct("chat_user").count()
        else:
            users_in_interval = Comment.objects \
                .filter(chat_group=chat_group, timestamp__range=(fr0m, t0)) \
                .distinct("chat_user").count()
        if users_in_interval > max.value:
            max = model.StatisticsAggregationDateValue(users_in_interval, fr0m)
        if users_in_interval < min.value:
            min = model.StatisticsAggregationDateValue(users_in_interval, fr0m)

        if end_time <= t0:
            break

    average = sum / intervals
    return sum, max, min, average


def get_most_hateful_users_within_chat_group_and_timeframe(chat_group: ChatGroup, start_time, end_time):
    start_time = datetime.combine(start_time.date(), start_time.time()).replace(tzinfo=utc)
    end_time = datetime.combine(end_time.date(), end_time.time()).replace(tzinfo=utc)

    general = []
    category = []

    general_qs = Comment.objects \
        .filter((Q(moderator_classification__isnull=False) & Q(moderator_classification__id__range=(1, 7)) | (
            Q(moderator_classification__isnull=True) & Q(classifier_classification__id__range=(1, 7)))),
                chat_group=chat_group, timestamp__range=(start_time, end_time)) \
        .values("chat_user") \
        .annotate(count=models.Count("chat_user")) \
        .order_by("count") \
        .reverse()

    category_qs = Comment.objects \
        .filter((Q(moderator_classification__isnull=False) & Q(moderator_classification__id__range=(1, 7)) | (
            Q(moderator_classification__isnull=True) & Q(classifier_classification__id__range=(1, 7)))),
                chat_group=chat_group, timestamp__range=(start_time, end_time)) \
        .values("classifier_classification", "chat_user") \
        .annotate(count=models.Count("chat_user")) \
        .order_by("classifier_classification", "count") \
        .exclude(classifier_classification__isnull=True) \
        .reverse()

    i = 0
    for result in general_qs:
        chatUser = ChatUser.objects.get(id=result["chat_user"])
        count = result["count"]
        i += 1
        general.append(
            model.UserHateSpeechInfo(
                chatUser.chat_user_name,
                i,
                count
            )
        )

    i = 0
    tmp_category = None
    for result in category_qs:
        classification = Classification.objects.get(id=result["classifier_classification"])
        chatUser = ChatUser.objects.get(id=result["chat_user"])
        count = result["count"]

        category_o = None
        for category_t in category:
            if category_t.category_name == classification.classification:
                category_o = category_t
        if category_o == None:
            category_o = model.HatefulUserDetailsCategory(classification.classification, [])
            category.append(category_o)
        if category_o != tmp_category:
            tmp_category = category_o
            i = 0
        i += 1
        category_o.users.append(
            model.UserHateSpeechInfo(
                chatUser.chat_user_name,
                i,
                count
            )
        )

    return general, category


def get_interval_data_as_trunc(chat_group, start_time, end_time, interval_size):
    """
    Gets QuerySets of general interval data and a QuerySet of hatespeech per category, grouped by the given interval
    @param chat_group: chatgroup that should be filtered for
    @param start_time: start of time interval
    @param end_time: end of time interval
    @param interval_size: form of interval of which the data should be grouped by, can be: second, minute, hour, day, week, month, quarter, year
    @returns QuerySet with general information and QuerySet with total hatespeech by categories
    """
    # total hateful comments
    total_comments = Comment.objects.filter(timestamp__range=(start_time, end_time), chat_group=chat_group).annotate(
        interval=Trunc('timestamp', interval_size)).values('interval').order_by('interval')

    total_hatespeech_by_category_interval_data = total_comments.values('classifier_classification',
                                                                       'interval').annotate(Count('id'))

    general_interval_data = total_comments.annotate(total_comments=Count('id'), total_hatespeech=Count('id', filter=Q(
        classifier_classification__id__gt=0) | Q(moderator_classification__id__gt=0)),
                                                    total_manually_hatespeech=Count('id', filter=Q(
                                                        moderator_classification__id__gt=0)),
                                                    total_automatically_hatespeech=Count('id', filter=Q(
                                                        classifier_classification__id__gt=0)),
                                                    total_manually_unflagged=Count('id', filter=Q(
                                                        moderator_classification__id=0) & Q(
                                                        reviewed_by_moderator=True)),
                                                    total_users=Count('chat_user__id', distinct=True))

    return general_interval_data, total_hatespeech_by_category_interval_data
