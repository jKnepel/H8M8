import dataclasses
from datetime import timedelta

import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_data_access as sda
import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_detailed_data_access as sdda
import HateMate_Backend_App.Atomic_Operation_Layer.Data_Access.statistic_detailed_data_model as model
import HateMate_Backend_App.models as database_entities
import pandas as pd
import zulu
from dateutil.relativedelta import relativedelta
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Sum, Avg, Max, Min


def get_detailed_statistic(authg, merged, interval, start, end, chatg_ids):
    """get detailed statistics of given chatgroups in given time period with given interval

    Args:
        authg (list): list of auth_groups
        merged (boolean): unused
        interval (str): interval for time frame
        start (str): start date time stamp
        end (str): end date time stamp
        chatg (list): list of chat group ids

    Returns:
        json: Detailed statistics of chat groups
    """
    start_timestamp = zulu.parse(start)
    end_timestamp = zulu.parse(end)

    # get chat groups from requested chat groups that the user actually has permissions to see
    visible_chat_groups = get_visible_chatgroups_from_requested_chatgroups(authg, chatg_ids)
    visible_chat_groups_ids = []
    # local testing visible_chat_groups = database_entities.ChatGroup.objects.all()

    # empty list for collecting all statistics for all chat groups
    collected_statistics_for_all_chatgroups = []

    # iterate over chatgroups
    for cgroup in visible_chat_groups:
        # add id to visible chat groups ids
        visible_chat_groups_ids.append(cgroup.id)

        # collect statistics
        data_object = collect_statistics(cgroup, start_timestamp, end_timestamp)

        # add to collector list
        collected_statistics_for_all_chatgroups.append(data_object)

    statistic_model = model.ChatGroupDetails(
        False,
        interval,
        start_timestamp,
        end_timestamp,
        visible_chat_groups_ids,
        data=collected_statistics_for_all_chatgroups
    )

    return dataclasses.asdict(statistic_model)


def collect_statistics(cgroup, start, end):
    """collect all statistics for a given chat group between the given start and end dates

    Args:
        cgroup (ChatGroup): A ChatGroup
        start (timestamp): Start Date
        end (timestamp): End Date

    Returns:
        Data: an object containing all statistics regarding a ChatGroup
    """
    # get all dates in between the start and end date as a list of dates
    dates = pd.date_range(start, end - timedelta(days=1), freq='d')
    # add end date manually because it is excluded in date_range
    dates = dates.insert(len(dates), end)

    server = get_server_name(cgroup)
    source_app = get_source_app(cgroup)
    total_comments = get_total_comments(cgroup, dates)
    current_session_info = get_session_info(cgroup)
    total_hs_comments = get_total_hs_comments(cgroup, dates)
    total_hs_comments_per_category = get_hs_comments_per_category(cgroup, start, end)
    automatically_flagged_comments = get_total_automatically_flagged_comments(cgroup, dates)
    total_users = get_statistic_for_chat_group_details__total_users(cgroup, start, end)
    total_hateful_users = get_statistic_for_chat_group_details__total_hateful_users(cgroup, start, end)
    most_hateful_users = get_statistic_for_chat_group_details__most_hateful_users(cgroup, start, end)
    manually_flagged_comments = get_total_manually_flagged_comments(cgroup, start, end)
    manually_unflagged_comments = get_total_manually_unflagged_comments(cgroup, start, end)
    interval_data = get_interval_data(cgroup, start, end)

    # create Data object for chat group
    return model.Data(
        source_app_name=source_app.source_app_name,
        source_app_id=source_app.id,
        chat_group_name=cgroup.chat_group_name,
        chat_group_id=cgroup.id,
        server_name=server.server_name,
        session_info=current_session_info,
        total_comments=total_comments,
        total_hatespeech_comments=total_hs_comments,
        total_hatespeech_comments_per_category=total_hs_comments_per_category,
        total_automatically_flagged_comments=automatically_flagged_comments,
        total_users=total_users,
        total_hateful_users=total_hateful_users,
        most_hateful_users=most_hateful_users,
        total_manually_flagged_comments=manually_flagged_comments,
        total_manually_unflagged_comments=manually_unflagged_comments,
        interval_data=interval_data
    )


def get_server_name(chat_group):
    """get server informations
    Args:
        chat_group(ChatGroup): a chatgroup

    Return:
        Server: Server for Chatgroup
    """
    return sda.get_server_for_chatgroup(chat_group.server_id)


def get_source_app(chat_group):
    """get source app informations
     Args:
        chat_group(ChatGroup): a chatgroup

    Return:
        SourceApp: The SourceApp for the Server
    """
    visible_server = sda.get_server_for_chatgroup(chat_group.server_id)
    source_app = sda.get_sourceapp_for_server(visible_server)
    return source_app


def get_session_info(chat_group):
    """get informations for current session
     Args:
        chat_group(ChatGroup): a chatgroup

    Return:
        SessionInfo: The SessionInfo for the current session
    """
    current_server = get_server_name(chat_group)
    sessions = sda.get_sessions(current_server)
    current_session = None

    """get current session"""
    for i, session in enumerate(sessions):
        if session.end_time is None:
            current_session = session
        if i == len(sessions) - 1:
            current_session = session

    if current_session:
        if current_session.end_time is None:
            return model.SessionInfo(True, str(current_session.start_time).replace('+00:00', 'Z'))
        else:
            return model.SessionInfo(False, str(current_session.start_time).replace('+00:00', 'Z'),
                                     str(current_session.end_time).replace('+00:00', 'Z'))
    else:
        return model.SessionInfo(False, None, None)


def get_total_comments(chat_group, dates):
    """get statistics for all comments

    Args:
        chat_group (ChatGroup): a chatgroup
        date_time_range (list): of dates

    Returns:
        TotalComments: statistics data
    """
    # initialize values
    count = 0
    max_day_value = None
    max_day_date = None
    min_day_value = None
    min_day_date = None
    counts_per_day = []

    # iterate over days
    for day in dates:
        all_comments_in_day = sdda.get_all_comments_in_day_and_chatgroup(day, chat_group)
        day_count = len(all_comments_in_day)
        # collect data
        ## for average
        counts_per_day.append(day_count)
        ## for total sum
        count += day_count

        ## for max
        if max_day_value is None or day_count > max_day_value:
            max_day_value = day_count
            max_day_date = day
        ## for min
        if min_day_value is None or day_count < min_day_value:
            min_day_value = day_count
            min_day_date = day

    # create dataclasses
    if count > 0:
        max_day = model.StatisticsAggregationDateValue(
            value=max_day_value,
            interval_date=max_day_date
        )
        min_day = model.StatisticsAggregationDateValue(
            value=min_day_value,
            interval_date=min_day_date
        )
        average = sum(counts_per_day) / len(counts_per_day)
    else:
        max_day = model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        )
        min_day = model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        )
        average = 0

    # create return dataclass
    return model.StatisticsAggregation(
        sum=count,
        max=max_day,
        min=min_day,
        average=average
    )


def get_total_hs_comments(chat_group, dates):
    """get statistics all comments that were classified as hatespeech

    Args:
        chat_group (ChatGroup): a chatgroup
        date_time_range (list): of dates

    Returns:
        TotalHatespeechComments: statistics data
    """
    # initialize values
    count = 0
    max_day_value = None
    max_day_date = None
    min_day_value = None
    min_day_date = None
    counts_per_day = []

    # iterate over days
    for day in dates:
        all_comments_in_day = sdda.get_all_comments_in_day_and_chatgroup(day, chat_group)
        day_count = 0
        for comment in all_comments_in_day:
            # calculate totalHatespeechComments
            if was_automatically_classified_as_hs(comment) or was_manually_classified_as_hs(comment):
                day_count += 1
        # collect data
        ## for average
        counts_per_day.append(day_count)
        ## for total sum
        count += day_count
        ## for max
        if max_day_value is None or day_count > max_day_value:
            max_day_value = day_count
            max_day_date = day
        ## for min
        if min_day_value is None or day_count < min_day_value:
            min_day_value = day_count
            min_day_date = day

    # create dataclasses
    if count > 0:
        max_day = model.StatisticsAggregationDateValue(
            value=max_day_value,
            interval_date=max_day_date
        )
        min_day = model.StatisticsAggregationDateValue(
            value=min_day_value,
            interval_date=min_day_date
        )
        average = sum(counts_per_day) / len(counts_per_day)
    else:
        max_day = model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        )
        min_day = model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        )
        average = 0

    # create return dataclass
    return model.StatisticsAggregation(
        sum=count,
        max=max_day,
        min=min_day,
        average=average
    )


def get_hs_comments_per_category(c_group, start, end):
    """get statistics for each category in a chatgroup and in given time window

    Args:
        chat_group (ChatGroup): a chatgroup
        start (date): start date
        end (date): end date

    Returns:
        TotalHatespeechCommentsPerCategory: statistics for each category
    """
    classifications = sda.get_all_hs_classifications()
    category_statistics = []
    for classification in classifications:
        comms = sdda.get_comments_in_period_chatgroup_category(c_group, start, end, classification)
        category_statistics.append(
            model.CategoryStatistic(
                category_name=classification.classification,
                totalSum=len(comms)
            )
        )
    return category_statistics


def get_total_automatically_flagged_comments(chat_group, dates):
    """get statistics for automatically flagged comments for chat group on the given dates

    Args:
        chat_group (ChatGroup): a chat group
        date_time_range (list): of dates

    Returns:
        TotalAutomaticallyFlaggedComments: statistics data
    """
    # initialize values
    count = 0
    max_day_value = None
    max_day_date = None
    min_day_value = None
    min_day_date = None
    counts_per_day = []

    # iterate over days
    for day in dates:
        all_comments_in_day = sdda.get_all_comments_in_day_and_chatgroup(day, chat_group)
        day_count = 0
        for comment in all_comments_in_day:
            # calculate totalAutomaticallyFlaggedComments
            if was_automatically_classified_as_hs(comment):
                day_count += 1
        # collect data
        ## for average
        counts_per_day.append(day_count)
        ## for total sum
        count += day_count
        ## for max
        if max_day_value is None or day_count > max_day_value:
            max_day_value = day_count
            max_day_date = day
        ## for min
        if min_day_value is None or day_count < min_day_value:
            min_day_value = day_count
            min_day_date = day

    # create dataclasses
    if count > 0:
        max_day = model.StatisticsAggregationDateValue(
            value=max_day_value,
            interval_date=max_day_date
        )
        min_day = model.StatisticsAggregationDateValue(
            value=min_day_value,
            interval_date=min_day_date
        )
        average = sum(counts_per_day) / len(counts_per_day)
    else:
        max_day = model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        )
        min_day = model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        )
        average = 0

    # create return dataclass
    return model.StatisticsAggregation(
        sum=count,
        max=max_day,
        min=min_day,
        average=average
    )


def was_automatically_classfied(comment):
    """check if comment was classified by classifier

    Args:
        comment (Comment): a comment

    Returns:
        Boolean: if comment was classified -> True
    """
    return comment.classifier_classification_id is not None


def was_manually_classfied(comment):
    """check if comment was classified by moderator

    Args:
        comment (Comment): a comment

    Returns:
        Boolean: if comment was classified -> True
    """
    return comment.moderator_classification_id is not None


# define helper method
def was_automatically_classified_as_hs(comment):
    """checks if a given comment falls into the hatespeech category
     (depending on the classifier_classification)

    Args:
        comment (Comment): a comment

    Returns:
        boolean: depending if classifier_classification is hs
    """
    if was_automatically_classfied(comment):
        return comment.classifier_classification_id > 0 and comment.classifier_classification_id < 8
    return False


def was_manually_classified_as_hs(comment):
    """checks if a given comment falls into the hatespeech category
     (depending on the moderator_classification)

    Args:
        comment (Comment): a comment

    Returns:
        boolean: depending if moderator_classification is hs
    """
    if was_manually_classfied(comment):
        return comment.moderator_classification_id > 0 and comment.moderator_classification_id < 8
    return False


def get_visible_chatgroups_from_requested_chatgroups(auth_groups, requested_chat_group_ids):
    """check if requested chat groups are visible for user (using the auth_groups)

    Args:
        auth_groups (AuthGroup): Permissions are bound to these
        requested_chat_group_ids (int): Chat Groups that need to be checked for their visibility

    Returns:
        list: ChatGroups that are visible for given auth groups
    """
    visible_servers = sda.get_all_servers_for_auth_user_groups(auth_groups)
    visible_chatgroups = sda.get_chat_groups_for_servers(visible_servers)

    visible_and_requested_chatgroups = []
    # check each visible chat group if it was requested
    for chat_group in visible_chatgroups:
        if chat_group.id in requested_chat_group_ids:
            visible_and_requested_chatgroups.append(chat_group)
    return visible_and_requested_chatgroups


def get_statistic_for_chat_group_details__total_users(chat_group: database_entities.ChatGroup, start_time,
                                                      end_time) -> model.StatisticsAggregation:
    sum, max, min, average = sdda.get_users_within_chat_group_and_timeframe(chat_group, start_time, end_time)
    if sum > 0:
        return model.StatisticsAggregation(sum, max, min, average)
    else:
        return model.StatisticsAggregation(0, model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        ), model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        ), 0)


def get_statistic_for_chat_group_details__total_hateful_users(chat_group: database_entities.ChatGroup, start_time,
                                                              end_time) -> model.StatisticsAggregation:
    sum, max, min, average = sdda.get_users_within_chat_group_and_timeframe(chat_group, start_time, end_time,
                                                                            hatespeach_only=True)
    if sum > 0:
        return model.StatisticsAggregation(sum, max, min, average)
    else:
        return model.StatisticsAggregation(0, model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        ), model.StatisticsAggregationDateValue(
            value=None,
            interval_date=None
        ), 0)


def get_statistic_for_chat_group_details__most_hateful_users(chat_group: database_entities.ChatGroup, start_time,
                                                             end_time) -> model.HatefulUserDetails:
    general, category = sdda.get_most_hateful_users_within_chat_group_and_timeframe(chat_group, start_time, end_time)
    return model.HatefulUserDetails(general, category)


def get_total_manually_flagged_comments(chat_group: database_entities.ChatGroup, start_time, end_time,
                                        interval_size="day"):
    """
    Gets all manually flagged comments in the given time range, filtered by chat group and grouped by the given interval size
    @param chat_group: chatgroup that should be filtered for
    @param start_time: start of time interval
    @param end_time: end of time interval
    @param interval_size: form of interval of which the data should be grouped by, can be: second, minute, hour, day, week, month, year. By default day.
    @returns StatisticsAggregation Object containing result or all 0 values if nothing was found
    """
    manually_flagged_comments = sdda.get_all_manually_flagged_comments_as_trunc(chat_group, start_time, end_time,
                                                                                interval_size)
    # Output Object with 0s if nothing was found, since fe cant parse null
    if not manually_flagged_comments:
        return model.StatisticsAggregation(0,
                                           model.StatisticsAggregationDateValue(
                                               value=None,
                                               interval_date=None
                                           ),
                                           model.StatisticsAggregationDateValue(
                                               value=None,
                                               interval_date=None
                                           ),
                                           0)
    # Fill missing intervals with 0 values

    aggregations = manually_flagged_comments.aggregate(Sum('flagged'), Max('flagged'), Min('flagged'),
                                                         Avg('flagged'))

    interval_count = getattr(relativedelta(end_time, start_time).normalized(), f"{interval_size}s") + 1
    min = aggregations["flagged__min"]
    avg = aggregations["flagged__avg"]
    min_interval_date = manually_flagged_comments.filter(flagged=aggregations['flagged__min']).first()
    if min_interval_date != None: min_interval_date = min_interval_date['interval']

    if manually_flagged_comments.count != interval_count:
        min = 0
        avg = aggregations["flagged__sum"] / interval_count
        for i in range(0, interval_count):
            empty_interval_date = start_time + relativedelta(**{f"{interval_size}s": i})
            if not manually_flagged_comments.filter(flagged=empty_interval_date).exists():
                min_interval_date = empty_interval_date
                break

    return model.StatisticsAggregation(aggregations['flagged__sum'],
                                        model.StatisticsAggregationDateValue(
                                            value=aggregations['flagged__max'],
                                            interval_date=
                                            manually_flagged_comments.get(flagged=aggregations['flagged__max'])[
                                                'interval']
                                        ),
                                        model.StatisticsAggregationDateValue(
                                            value=min,
                                            interval_date=min_interval_date

                                        ),
                                        avg)


def get_total_manually_unflagged_comments(chat_group: database_entities.ChatGroup, start_time, end_time,
                                          interval_size="day"):
    """
    Gets all manually flagged comments in the given time range, filtered by chat group and grouped by the given interval size
    @param chat_group: chatgroup that should be filtered for
    @param start_time: start of time interval
    @param end_time: end of time interval
    @param interval_size: form of interval of which the data should be grouped by, can be: second, minute, hour, day, week, month, year. By default day.
    @returns StatisticsAggregation Object containing result or all 0 values if nothing was found
    """
    manually_unflagged_comments = sdda.get_all_manually_unflagged_comments_as_trunc(chat_group, start_time, end_time,
                                                                                    interval_size)
    # Output Object with 0s if nothing was found, since fe cant parse null
    if not manually_unflagged_comments:
        return model.StatisticsAggregation(0,
                                           model.StatisticsAggregationDateValue(
                                               value=None,
                                               interval_date=None
                                           ),
                                           model.StatisticsAggregationDateValue(
                                               value=None,
                                               interval_date=None
                                           ),
                                           0)

    aggregations = manually_unflagged_comments.aggregate(Sum('unflagged'), Max('unflagged'), Min('unflagged'),
                                                         Avg('unflagged'))

    interval_count = getattr(relativedelta(end_time, start_time).normalized(), f"{interval_size}s") + 1
    min = aggregations["unflagged__min"]
    avg = aggregations["unflagged__avg"]
    min_interval_date = manually_unflagged_comments.filter(unflagged=aggregations['unflagged__min']).first()
    if min_interval_date != None: min_interval_date = min_interval_date['interval']

    if manually_unflagged_comments.count != interval_count:
        min = 0
        avg = aggregations["unflagged__sum"] / interval_count
        for i in range(0, interval_count):
            empty_interval_date = start_time + relativedelta(**{f"{interval_size}s": i})
            if not manually_unflagged_comments.filter(unflagged=empty_interval_date).exists():
                min_interval_date = empty_interval_date
                break

    stats = model.StatisticsAggregation(aggregations['unflagged__sum'],
                                        model.StatisticsAggregationDateValue(
                                            value=aggregations['unflagged__max'],
                                            interval_date=
                                            manually_unflagged_comments.get(unflagged=aggregations['unflagged__max'])[
                                                'interval']
                                        ),
                                        model.StatisticsAggregationDateValue(
                                            value=min,
                                            interval_date=min_interval_date

                                        ),
                                        avg)
    return stats


def get_interval_data(chat_group: database_entities.ChatGroup, start_time, end_time,
                      interval_size="day"):
    """
    Gets IntervalData Objects in an array, each entry represents one instance of the given interval
    @param chat_group: chatgroup that should be filtered for
    @param start_time: start of time interval
    @param end_time: end of time interval
    @param interval_size: form of interval of which the data should be grouped by, can be: second, minute, hour, day, week, month, quarter, year. By default day.
    @returns Array of interval data objects
    """
    general_interval_data_qs, hs_by_category_interval_data_qs = sdda.get_interval_data_as_trunc(chat_group, start_time,
                                                                                                end_time, interval_size)
    # get all intervals as qs
    intervals = general_interval_data_qs.values('interval').order_by('interval')
    # get all classifications
    classifications = database_entities.Classification.objects.all()

    interval_data = []
    for interval in intervals:
        general_data_in_given_interval = general_interval_data_qs.get(interval=interval['interval'])
        hs_by_category_in_current_interval_qs = hs_by_category_interval_data_qs.filter(interval=interval['interval'])

        # create category array
        category_statistics = []
        for classification in classifications:
            try:
                category = model.CategoryStatistic(classification.classification,
                                                   hs_by_category_in_current_interval_qs.get(
                                                       classifier_classification=classification.id)['id__count'])
                category_statistics.append(category)
            except ObjectDoesNotExist:
                category_statistics.append(model.CategoryStatistic(classification.classification, 0))

        # add general info and create data object
        interval_data.append(model.IntervalData(interval['interval'], general_data_in_given_interval['total_comments'],
                                                general_data_in_given_interval['total_hatespeech'],
                                                general_data_in_given_interval['total_manually_hatespeech'],
                                                general_data_in_given_interval[
                                                    'total_automatically_hatespeech'],
                                                general_data_in_given_interval['total_manually_unflagged'],
                                                general_data_in_given_interval['total_users'],
                                                category_statistics))
    return interval_data
