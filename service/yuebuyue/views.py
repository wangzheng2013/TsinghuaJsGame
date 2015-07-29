from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, render_to_response
from django.template import RequestContext
#my
from django.http import HttpResponse,Http404
from django import template
import datetime


#model import
from yuebuyue.models import User

def home(request):
    users = User.objects.all()
    fp = open('G:/web/index.html')
    t = template.Template(fp.read())
    fp.close()
    html = t.render(template.Context({ 'users': users}))
    return HttpResponse(html)

def time(request):
    now = datetime.datetime.now()
    fp = open('G:/web/time.html')
    t = template.Template(fp.read())
    fp.close()
    html = t.render(template.Context({'current_date':now}))
    return HttpResponse(html)

