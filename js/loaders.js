/*
 * Projects
 */
oss_projects = {};
oss_projects['koma-console'] = {
  position: 1,
  featured: true,  
  background: 'koma-component.jpg'
};
oss_projects['koma-xmpp-server'] = {
  position: 2,
  featured: true,
  background: 'koma-interface.jpg'
};
oss_projects['koma-msb'] = {
  background: 'koma-msb.jpg'
};
oss_projects['koma-fcm'] = {
  background: 'koma-fcm.jpg'
};
oss_projects['koma-xmpp-client'] = {
  background: 'koma-fcm.jpg'
};
 
/*
 * Organization
 */
Organization = function(name, repos) {
  this.name = name;
  this.repos = repos || [];
}

Organization.prototype.totalForks = function() {
  total = 0;
  this.repos.forEach(function(repo) {
    total += repo.forks;
  });

  return total;
}

Organization.prototype.totalWatchers = function() {
  total = 0;
  this.repos.forEach(function(repo) {
    total += repo.watchers;
  });

  return total;
}

Organization.prototype.forkedCount = function() {
  total = 0;
  this.repos.forEach(function(repo) {
    if (repo.fork) {
      total += 1;
    }
  });

  return total;
}

Organization.prototype.notForkedCount = function() {
  total = 0;
  this.repos.forEach(function(repo) {
    if (!repo.fork) {
      total += 1;
    }
  });

  return total;
}

Organization.prototype.featuredRepos = function() {
  featured = [];
  this.repos.forEach(function(repo) {
    if (repo.featured() && !repo.fork) {
      if (repo.position()) {
        featured[repo.position()-1] = repo
      } else {
        featured.push(repo);
      }
    }
  });

  return featured;
}

Organization.prototype.deprecatedRepos = function() {
  deprecated = [];
  this.repos.forEach(function(repo) {
    if (repo.deprecated() && !repo.fork) {
      deprecated.push(repo);
    }
  });

  return deprecated;
}


Organization.prototype.forkedRepos = function() {
  forked = [];
  this.repos.forEach(function(repo) {
    if (repo.fork) {
      forked.push(repo);
    }
  });

  return forked;
}

Organization.prototype.regularRepos = function() {
  regular = [];
  this.repos.forEach(function(repo) {
    if (!repo.fork && !repo.featured() && !repo.deprecated()) {
      regular.push(repo);
    }
  });

  return regular;
}

Organization.prototype.addReposToContainer = function(container, repos) {
  repos.forEach(function(repo, i) {
    container.append(repo.getContainer(i+1));
  });
}

/*
 * Repository
 */
Repository = function(repo) {
  // attributes
  this.name        = repo.name;
  this.language    = repo.language;
  this.url         = repo.html_url;
  this.description = repo.description;
  this.fork        = repo.fork;
  this.watchers    = repo.watchers;
  this.forks       = repo.forks;  
  this.homepage    = repo.homepage;
}

Repository.prototype.featured = function() {
  return oss_projects[this.name] && oss_projects[this.name].featured;
}

Repository.prototype.deprecated = function() {
  return oss_projects[this.name] && oss_projects[this.name].deprecated;
}

Repository.prototype.position = function() {
  if (oss_projects[this.name] && oss_projects[this.name].position) {
    return oss_projects[this.name].position;
  }
}

Repository.prototype.logo = function() {
  if (oss_projects[this.name] && oss_projects[this.name].logo) {
    return oss_projects[this.name].logo;
  }
}

Repository.prototype.background = function() {
  if (oss_projects[this.name] && oss_projects[this.name].background) {
    return oss_projects[this.name].background;
  }
  else{
	return 'koma-generator.jpg'
  }
}

Repository.prototype.classes = function() {
  if (this.featured()) {
    return 'featured-project';
  } else if (this.deprecated()) {
    return 'deprecated-project';
  }
}

Repository.prototype.getHomePage = function() {
  if (this.homepage) {
	if(this.homepage=='https://koma-network.github.io'){
		return this.url;
	}else{
		return this.homepage;
	}
  }else{
	return this.url;
  }
}

Repository.prototype.getContainer = function(index) {
  var last = '';
  if (index % 4 == 0) { last = 'last-in-row' }
  
  return [
    '<div class="col-sm-2 text-center">',
    '    <div class="thumbnail">',
    '    <a href="', this.getHomePage(), '">',
    '          <img src="images/opensource/',this.background(),'" alt="Community" class="img-responsive center-block" style="height:100px"/>',
    '            <div class="caption">',
    '                  <p style="color:#000">',this.name,'</p>',
	'                  <p style="color:#000">',this.language,'</p>',
    '            </div>',
    '    </a>',
    '    </div>',
    '</div>'
  ].join('');
}

Repository.prototype.featuredImage = function() {
  if (this.featured()) {
    return [
      '<div class="island-item featured-image">',
        '<img src="/images/opensource/', this.background() ,'">',
      '</div>'
    ].join('');
  }
}

Repository.prototype.headerLogo = function() {
  if (this.logo()) {
    return '<img src="/images/opensource/' + this.logo() + '" height="21px" width="26px" class="logo"> ';
  }
}

Repository.prototype.repoContent = function() {
  return [
    '<div class="island-item">',
      '<h3>',
        '<a href="', this.url, '" target="_blank">', this.headerLogo(), this.name, '</a>',
      '</h3>',
      '<div class="repo-info">',
        '<span><i class="octicon octicon-star"></i> ', this.watchers, '</span> ',
        '<span><i class="octicon octicon-repo-forked"></i> ', this.forks, '</span>',
        '<span class="language ', this.language ,'">', this.language, '</span>',
      '</div>',
      '<p>', this.description, '</p>',
    '</div>'
  ].join('');
}

/*
 * Loader
 */
function getAllPages(urlPrefix, callback, page, results) {
  page = page || 1;
  results = results || [];

  var url = urlPrefix + '?per_page=100&page=' + parseInt(page);

  $.get(url, function(data) {
    if (data.length > 0) {
      data.forEach(function(resultDatum) {
        results.push(resultDatum);
      });
      getAllPages(urlPrefix, callback, page + 1, results);
    }
    else {
      callback(results);
    }
  });
}

function getGithubRepos(callback, page, repos) {
  getAllPages('https://api.github.com/users/koma-network/repos', callback);
}

function loadRepositoryData(repoData) {
  var org = new Organization('koma-network');
  org.repos = [];

  repoData.forEach(function(repoDatum) {
    org.repos.push(new Repository(repoDatum));
  });

  $('.projects .featured').empty();
  $('.projects .not-featured').empty();

  org.addReposToContainer($('.projects .featured'), org.featuredRepos());
  org.addReposToContainer($('.projects .not-featured'), org.regularRepos());

  $('.project-count').html(org.forkedCount());
}

$(document).ready(function() {
  getGithubRepos(loadRepositoryData);
});
